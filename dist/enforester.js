"use strict";

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

var _loadSyntax = require("./load-syntax");

var _macroContext = require("./macro-context");

var _macroContext2 = _interopRequireDefault(_macroContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXPR_LOOP_OPERATOR_41 = {};
const EXPR_LOOP_NO_CHANGE_42 = {};
const EXPR_LOOP_EXPANSION_43 = {};
class Enforester_44 {
  constructor(stxl_45, prev_46, context_47) {
    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl_45), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev_46), "expecting a list of terms to enforest");
    (0, _errors.assert)(context_47, "expecting a context to enforest");
    this.term = null;
    this.rest = stxl_45;
    this.prev = prev_46;
    this.context = context_47;
  }
  peek() {
    let n_48 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    return this.rest.get(n_48);
  }
  advance() {
    let ret_49 = this.rest.first();
    this.rest = this.rest.rest();
    return ret_49;
  }
  enforest() {
    let type_50 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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
    let result_51;
    if (type_50 === "expression") {
      result_51 = this.enforestExpressionLoop();
    } else {
      result_51 = this.enforestModule();
    }
    if (this.rest.size === 0) {
      this.done = true;
    }
    return result_51;
  }
  enforestModule() {
    return this.enforestBody();
  }
  enforestBody() {
    return this.enforestModuleItem();
  }
  enforestModuleItem() {
    let lookahead_52 = this.peek();
    if (this.isKeyword(lookahead_52, "import")) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isKeyword(lookahead_52, "export")) {
      this.advance();
      return this.enforestExportDeclaration();
    } else if (this.isIdentifier(lookahead_52, "#")) {
      return this.enforestLanguagePragma();
    }
    return this.enforestStatement();
  }
  enforestLanguagePragma() {
    this.matchIdentifier("#");
    this.matchIdentifier("lang");
    let path_53 = this.matchStringLiteral();
    this.consumeSemicolon();
    return new _terms2.default("Pragma", { kind: "lang", items: _immutable.List.of(path_53) });
  }
  enforestExportDeclaration() {
    let lookahead_54 = this.peek();
    if (this.isPunctuator(lookahead_54, "*")) {
      this.advance();
      let moduleSpecifier = this.enforestFromClause();
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
    } else if (this.isBraces(lookahead_54)) {
      let namedExports = this.enforestExportClause();
      let moduleSpecifier = null;
      if (this.isIdentifier(this.peek(), "from")) {
        moduleSpecifier = this.enforestFromClause();
      }
      return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: moduleSpecifier });
    } else if (this.isKeyword(lookahead_54, "class")) {
      return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
    } else if (this.isFnDeclTransform(lookahead_54)) {
      return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
    } else if (this.isKeyword(lookahead_54, "default")) {
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
    } else if (this.isVarDeclTransform(lookahead_54) || this.isLetDeclTransform(lookahead_54) || this.isConstDeclTransform(lookahead_54) || this.isSyntaxrecDeclTransform(lookahead_54) || this.isSyntaxDeclTransform(lookahead_54)) {
      return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
    }
    throw this.createError(lookahead_54, "unexpected syntax");
  }
  enforestExportClause() {
    let enf_55 = new Enforester_44(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_56 = [];
    while (enf_55.rest.size !== 0) {
      result_56.push(enf_55.enforestExportSpecifier());
      enf_55.consumeComma();
    }
    return (0, _immutable.List)(result_56);
  }
  enforestExportSpecifier() {
    let name_57 = this.enforestIdentifier();
    if (this.isIdentifier(this.peek(), "as")) {
      this.advance();
      let exportedName = this.enforestIdentifier();
      return new _terms2.default("ExportSpecifier", { name: name_57, exportedName: exportedName });
    }
    return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_57 });
  }
  enforestImportDeclaration() {
    let lookahead_58 = this.peek();
    let defaultBinding_59 = null;
    let namedImports_60 = (0, _immutable.List)();
    let forSyntax_61 = false;
    if (this.isStringLiteral(lookahead_58)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new _terms2.default("Import", { defaultBinding: defaultBinding_59, namedImports: namedImports_60, moduleSpecifier: moduleSpecifier });
    }
    if (this.isIdentifier(lookahead_58) || this.isKeyword(lookahead_58)) {
      defaultBinding_59 = this.enforestBindingIdentifier();
      if (!this.isPunctuator(this.peek(), ",")) {
        let moduleSpecifier = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_61 = true;
        }
        return new _terms2.default("Import", { defaultBinding: defaultBinding_59, moduleSpecifier: moduleSpecifier, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_61 });
      }
    }
    this.consumeComma();
    lookahead_58 = this.peek();
    if (this.isBraces(lookahead_58)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_61 = true;
      }
      return new _terms2.default("Import", { defaultBinding: defaultBinding_59, forSyntax: forSyntax_61, namedImports: imports, moduleSpecifier: fromClause });
    } else if (this.isPunctuator(lookahead_58, "*")) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_61 = true;
      }
      return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_59, forSyntax: forSyntax_61, namespaceBinding: namespaceBinding, moduleSpecifier: moduleSpecifier });
    }
    throw this.createError(lookahead_58, "unexpected syntax");
  }
  enforestNamespaceBinding() {
    this.matchPunctuator("*");
    this.matchIdentifier("as");
    return this.enforestBindingIdentifier();
  }
  enforestNamedImports() {
    let enf_62 = new Enforester_44(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_63 = [];
    while (enf_62.rest.size !== 0) {
      result_63.push(enf_62.enforestImportSpecifiers());
      enf_62.consumeComma();
    }
    return (0, _immutable.List)(result_63);
  }
  enforestImportSpecifiers() {
    let lookahead_64 = this.peek();
    let name_65;
    if (this.isIdentifier(lookahead_64) || this.isKeyword(lookahead_64)) {
      name_65 = this.advance();
      if (!this.isIdentifier(this.peek(), "as")) {
        return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_65 }) });
      } else {
        this.matchIdentifier("as");
      }
    } else {
      throw this.createError(lookahead_64, "unexpected token in import specifier");
    }
    return new _terms2.default("ImportSpecifier", { name: name_65, binding: this.enforestBindingIdentifier() });
  }
  enforestFromClause() {
    this.matchIdentifier("from");
    let lookahead_66 = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead_66;
  }
  enforestStatementListItem() {
    let lookahead_67 = this.peek();
    if (this.isFnDeclTransform(lookahead_67)) {
      return this.enforestFunctionDeclaration({ isExpr: false });
    } else if (this.isKeyword(lookahead_67, "class")) {
      return this.enforestClass({ isExpr: false });
    } else {
      return this.enforestStatement();
    }
  }
  enforestStatement() {
    let lookahead_68 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_68)) {
      this.expandMacro();
      lookahead_68 = this.peek();
    }
    if (this.term === null && this.isTerm(lookahead_68)) {
      return this.advance();
    }
    if (this.term === null && this.isBraces(lookahead_68)) {
      return this.enforestBlockStatement();
    }
    if (this.term === null && this.isWhileTransform(lookahead_68)) {
      return this.enforestWhileStatement();
    }
    if (this.term === null && this.isIfTransform(lookahead_68)) {
      return this.enforestIfStatement();
    }
    if (this.term === null && this.isForTransform(lookahead_68)) {
      return this.enforestForStatement();
    }
    if (this.term === null && this.isSwitchTransform(lookahead_68)) {
      return this.enforestSwitchStatement();
    }
    if (this.term === null && this.isBreakTransform(lookahead_68)) {
      return this.enforestBreakStatement();
    }
    if (this.term === null && this.isContinueTransform(lookahead_68)) {
      return this.enforestContinueStatement();
    }
    if (this.term === null && this.isDoTransform(lookahead_68)) {
      return this.enforestDoStatement();
    }
    if (this.term === null && this.isDebuggerTransform(lookahead_68)) {
      return this.enforestDebuggerStatement();
    }
    if (this.term === null && this.isWithTransform(lookahead_68)) {
      return this.enforestWithStatement();
    }
    if (this.term === null && this.isTryTransform(lookahead_68)) {
      return this.enforestTryStatement();
    }
    if (this.term === null && this.isThrowTransform(lookahead_68)) {
      return this.enforestThrowStatement();
    }
    if (this.term === null && this.isKeyword(lookahead_68, "class")) {
      return this.enforestClass({ isExpr: false });
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_68)) {
      return this.enforestFunctionDeclaration();
    }
    if (this.term === null && this.isIdentifier(lookahead_68) && this.isPunctuator(this.peek(1), ":")) {
      return this.enforestLabeledStatement();
    }
    if (this.term === null && (this.isVarDeclTransform(lookahead_68) || this.isLetDeclTransform(lookahead_68) || this.isConstDeclTransform(lookahead_68) || this.isSyntaxrecDeclTransform(lookahead_68) || this.isSyntaxDeclTransform(lookahead_68))) {
      let stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });
      this.consumeSemicolon();
      return stmt;
    }
    if (this.term === null && this.isReturnStmtTransform(lookahead_68)) {
      return this.enforestReturnStatement();
    }
    if (this.term === null && this.isPunctuator(lookahead_68, ";")) {
      this.advance();
      return new _terms2.default("EmptyStatement", {});
    }
    return this.enforestExpressionStatement();
  }
  enforestLabeledStatement() {
    let label_69 = this.matchIdentifier();
    let punc_70 = this.matchPunctuator(":");
    let stmt_71 = this.enforestStatement();
    return new _terms2.default("LabeledStatement", { label: label_69, body: stmt_71 });
  }
  enforestBreakStatement() {
    this.matchKeyword("break");
    let lookahead_72 = this.peek();
    let label_73 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_72, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("BreakStatement", { label: label_73 });
    }
    if (this.isIdentifier(lookahead_72) || this.isKeyword(lookahead_72, "yield") || this.isKeyword(lookahead_72, "let")) {
      label_73 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("BreakStatement", { label: label_73 });
  }
  enforestTryStatement() {
    this.matchKeyword("try");
    let body_74 = this.enforestBlock();
    if (this.isKeyword(this.peek(), "catch")) {
      let catchClause = this.enforestCatchClause();
      if (this.isKeyword(this.peek(), "finally")) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_74, catchClause: catchClause, finalizer: finalizer });
      }
      return new _terms2.default("TryCatchStatement", { body: body_74, catchClause: catchClause });
    }
    if (this.isKeyword(this.peek(), "finally")) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new _terms2.default("TryFinallyStatement", { body: body_74, catchClause: null, finalizer: finalizer });
    }
    throw this.createError(this.peek(), "try with no catch or finally");
  }
  enforestCatchClause() {
    this.matchKeyword("catch");
    let bindingParens_75 = this.matchParens();
    let enf_76 = new Enforester_44(bindingParens_75, (0, _immutable.List)(), this.context);
    let binding_77 = enf_76.enforestBindingTarget();
    let body_78 = this.enforestBlock();
    return new _terms2.default("CatchClause", { binding: binding_77, body: body_78 });
  }
  enforestThrowStatement() {
    this.matchKeyword("throw");
    let expression_79 = this.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("ThrowStatement", { expression: expression_79 });
  }
  enforestWithStatement() {
    this.matchKeyword("with");
    let objParens_80 = this.matchParens();
    let enf_81 = new Enforester_44(objParens_80, (0, _immutable.List)(), this.context);
    let object_82 = enf_81.enforestExpression();
    let body_83 = this.enforestStatement();
    return new _terms2.default("WithStatement", { object: object_82, body: body_83 });
  }
  enforestDebuggerStatement() {
    this.matchKeyword("debugger");
    return new _terms2.default("DebuggerStatement", {});
  }
  enforestDoStatement() {
    this.matchKeyword("do");
    let body_84 = this.enforestStatement();
    this.matchKeyword("while");
    let testBody_85 = this.matchParens();
    let enf_86 = new Enforester_44(testBody_85, (0, _immutable.List)(), this.context);
    let test_87 = enf_86.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("DoWhileStatement", { body: body_84, test: test_87 });
  }
  enforestContinueStatement() {
    let kwd_88 = this.matchKeyword("continue");
    let lookahead_89 = this.peek();
    let label_90 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_89, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("ContinueStatement", { label: label_90 });
    }
    if (this.lineNumberEq(kwd_88, lookahead_89) && (this.isIdentifier(lookahead_89) || this.isKeyword(lookahead_89, "yield") || this.isKeyword(lookahead_89, "let"))) {
      label_90 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("ContinueStatement", { label: label_90 });
  }
  enforestSwitchStatement() {
    this.matchKeyword("switch");
    let cond_91 = this.matchParens();
    let enf_92 = new Enforester_44(cond_91, (0, _immutable.List)(), this.context);
    let discriminant_93 = enf_92.enforestExpression();
    let body_94 = this.matchCurlies();
    if (body_94.size === 0) {
      return new _terms2.default("SwitchStatement", { discriminant: discriminant_93, cases: (0, _immutable.List)() });
    }
    enf_92 = new Enforester_44(body_94, (0, _immutable.List)(), this.context);
    let cases_95 = enf_92.enforestSwitchCases();
    let lookahead_96 = enf_92.peek();
    if (enf_92.isKeyword(lookahead_96, "default")) {
      let defaultCase = enf_92.enforestSwitchDefault();
      let postDefaultCases = enf_92.enforestSwitchCases();
      return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_93, preDefaultCases: cases_95, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
    }
    return new _terms2.default("SwitchStatement", { discriminant: discriminant_93, cases: cases_95 });
  }
  enforestSwitchCases() {
    let cases_97 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
      cases_97.push(this.enforestSwitchCase());
    }
    return (0, _immutable.List)(cases_97);
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
    let result_98 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
      result_98.push(this.enforestStatementListItem());
    }
    return (0, _immutable.List)(result_98);
  }
  enforestSwitchDefault() {
    this.matchKeyword("default");
    return new _terms2.default("SwitchDefault", { consequent: this.enforestSwitchCaseBody() });
  }
  enforestForStatement() {
    this.matchKeyword("for");
    let cond_99 = this.matchParens();
    let enf_100 = new Enforester_44(cond_99, (0, _immutable.List)(), this.context);
    let lookahead_101, test_102, init_103, right_104, type_105, left_106, update_107;
    if (enf_100.isPunctuator(enf_100.peek(), ";")) {
      enf_100.advance();
      if (!enf_100.isPunctuator(enf_100.peek(), ";")) {
        test_102 = enf_100.enforestExpression();
      }
      enf_100.matchPunctuator(";");
      if (enf_100.rest.size !== 0) {
        right_104 = enf_100.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: null, test: test_102, update: right_104, body: this.enforestStatement() });
    } else {
      lookahead_101 = enf_100.peek();
      if (enf_100.isVarDeclTransform(lookahead_101) || enf_100.isLetDeclTransform(lookahead_101) || enf_100.isConstDeclTransform(lookahead_101)) {
        init_103 = enf_100.enforestVariableDeclaration();
        lookahead_101 = enf_100.peek();
        if (this.isKeyword(lookahead_101, "in") || this.isIdentifier(lookahead_101, "of")) {
          if (this.isKeyword(lookahead_101, "in")) {
            enf_100.advance();
            right_104 = enf_100.enforestExpression();
            type_105 = "ForInStatement";
          } else if (this.isIdentifier(lookahead_101, "of")) {
            enf_100.advance();
            right_104 = enf_100.enforestExpression();
            type_105 = "ForOfStatement";
          }
          return new _terms2.default(type_105, { left: init_103, right: right_104, body: this.enforestStatement() });
        }
        enf_100.matchPunctuator(";");
        if (enf_100.isPunctuator(enf_100.peek(), ";")) {
          enf_100.advance();
          test_102 = null;
        } else {
          test_102 = enf_100.enforestExpression();
          enf_100.matchPunctuator(";");
        }
        update_107 = enf_100.enforestExpression();
      } else {
        if (this.isKeyword(enf_100.peek(1), "in") || this.isIdentifier(enf_100.peek(1), "of")) {
          left_106 = enf_100.enforestBindingIdentifier();
          let kind = enf_100.advance();
          if (this.isKeyword(kind, "in")) {
            type_105 = "ForInStatement";
          } else {
            type_105 = "ForOfStatement";
          }
          right_104 = enf_100.enforestExpression();
          return new _terms2.default(type_105, { left: left_106, right: right_104, body: this.enforestStatement() });
        }
        init_103 = enf_100.enforestExpression();
        enf_100.matchPunctuator(";");
        if (enf_100.isPunctuator(enf_100.peek(), ";")) {
          enf_100.advance();
          test_102 = null;
        } else {
          test_102 = enf_100.enforestExpression();
          enf_100.matchPunctuator(";");
        }
        update_107 = enf_100.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: init_103, test: test_102, update: update_107, body: this.enforestStatement() });
    }
  }
  enforestIfStatement() {
    this.matchKeyword("if");
    let cond_108 = this.matchParens();
    let enf_109 = new Enforester_44(cond_108, (0, _immutable.List)(), this.context);
    let lookahead_110 = enf_109.peek();
    let test_111 = enf_109.enforestExpression();
    if (test_111 === null) {
      throw enf_109.createError(lookahead_110, "expecting an expression");
    }
    let consequent_112 = this.enforestStatement();
    let alternate_113 = null;
    if (this.isKeyword(this.peek(), "else")) {
      this.advance();
      alternate_113 = this.enforestStatement();
    }
    return new _terms2.default("IfStatement", { test: test_111, consequent: consequent_112, alternate: alternate_113 });
  }
  enforestWhileStatement() {
    this.matchKeyword("while");
    let cond_114 = this.matchParens();
    let enf_115 = new Enforester_44(cond_114, (0, _immutable.List)(), this.context);
    let lookahead_116 = enf_115.peek();
    let test_117 = enf_115.enforestExpression();
    if (test_117 === null) {
      throw enf_115.createError(lookahead_116, "expecting an expression");
    }
    let body_118 = this.enforestStatement();
    return new _terms2.default("WhileStatement", { test: test_117, body: body_118 });
  }
  enforestBlockStatement() {
    return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
  }
  enforestBlock() {
    let b_119 = this.matchCurlies();
    let body_120 = [];
    let enf_121 = new Enforester_44(b_119, (0, _immutable.List)(), this.context);
    while (enf_121.rest.size !== 0) {
      let lookahead = enf_121.peek();
      let stmt = enf_121.enforestStatement();
      if (stmt == null) {
        throw enf_121.createError(lookahead, "not a statement");
      }
      body_120.push(stmt);
    }
    return new _terms2.default("Block", { statements: (0, _immutable.List)(body_120) });
  }
  enforestClass(_ref) {
    let isExpr = _ref.isExpr;
    let inDefault = _ref.inDefault;

    let kw_122 = this.advance();
    let name_123 = null,
        supr_124 = null;
    let type_125 = isExpr ? "ClassExpression" : "ClassDeclaration";
    if (this.isIdentifier(this.peek())) {
      name_123 = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name_123 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_122) });
      } else {
        throw this.createError(this.peek(), "unexpected syntax");
      }
    }
    if (this.isKeyword(this.peek(), "extends")) {
      this.advance();
      supr_124 = this.enforestExpressionLoop();
    }
    let elements_126 = [];
    let enf_127 = new Enforester_44(this.matchCurlies(), (0, _immutable.List)(), this.context);
    while (enf_127.rest.size !== 0) {
      if (enf_127.isPunctuator(enf_127.peek(), ";")) {
        enf_127.advance();
        continue;
      }
      let isStatic = false;

      var _enf_127$enforestMeth = enf_127.enforestMethodDefinition();

      let methodOrKey = _enf_127$enforestMeth.methodOrKey;
      let kind = _enf_127$enforestMeth.kind;

      if (kind === "identifier" && methodOrKey.value.val() === "static") {
        isStatic = true;

        var _enf_127$enforestMeth2 = enf_127.enforestMethodDefinition();

        methodOrKey = _enf_127$enforestMeth2.methodOrKey;
        kind = _enf_127$enforestMeth2.kind;
      }
      if (kind === "method") {
        elements_126.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
      } else {
        throw this.createError(enf_127.peek(), "Only methods are allowed in classes");
      }
    }
    return new _terms2.default(type_125, { name: name_123, super: supr_124, elements: (0, _immutable.List)(elements_126) });
  }
  enforestBindingTarget() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref2.allowPunctuator;

    let lookahead_128 = this.peek();
    if (this.isIdentifier(lookahead_128) || this.isKeyword(lookahead_128) || allowPunctuator && this.isPunctuator(lookahead_128)) {
      return this.enforestBindingIdentifier({ allowPunctuator: allowPunctuator });
    } else if (this.isBrackets(lookahead_128)) {
      return this.enforestArrayBinding();
    } else if (this.isBraces(lookahead_128)) {
      return this.enforestObjectBinding();
    }
    (0, _errors.assert)(false, "not implemented yet");
  }
  enforestObjectBinding() {
    let enf_129 = new Enforester_44(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let properties_130 = [];
    while (enf_129.rest.size !== 0) {
      properties_130.push(enf_129.enforestBindingProperty());
      enf_129.consumeComma();
    }
    return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_130) });
  }
  enforestBindingProperty() {
    let lookahead_131 = this.peek();

    var _enforestPropertyName = this.enforestPropertyName();

    let name = _enforestPropertyName.name;
    let binding = _enforestPropertyName.binding;

    if (this.isIdentifier(lookahead_131) || this.isKeyword(lookahead_131, "let") || this.isKeyword(lookahead_131, "yield")) {
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
    let bracket_132 = this.matchSquares();
    let enf_133 = new Enforester_44(bracket_132, (0, _immutable.List)(), this.context);
    let elements_134 = [],
        restElement_135 = null;
    while (enf_133.rest.size !== 0) {
      let el;
      if (enf_133.isPunctuator(enf_133.peek(), ",")) {
        enf_133.consumeComma();
        el = null;
      } else {
        if (enf_133.isPunctuator(enf_133.peek(), "...")) {
          enf_133.advance();
          restElement_135 = enf_133.enforestBindingTarget();
          break;
        } else {
          el = enf_133.enforestBindingElement();
        }
        enf_133.consumeComma();
      }
      elements_134.push(el);
    }
    return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_134), restElement: restElement_135 });
  }
  enforestBindingElement() {
    let binding_136 = this.enforestBindingTarget();
    if (this.isAssign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding_136 = new _terms2.default("BindingWithDefault", { binding: binding_136, init: init });
    }
    return binding_136;
  }
  enforestBindingIdentifier() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref3.allowPunctuator;

    let name_137;
    if (allowPunctuator && this.isPunctuator(this.peek())) {
      name_137 = this.enforestPunctuator();
    } else {
      name_137 = this.enforestIdentifier();
    }
    return new _terms2.default("BindingIdentifier", { name: name_137 });
  }
  enforestPunctuator() {
    let lookahead_138 = this.peek();
    if (this.isPunctuator(lookahead_138)) {
      return this.advance();
    }
    throw this.createError(lookahead_138, "expecting a punctuator");
  }
  enforestIdentifier() {
    let lookahead_139 = this.peek();
    if (this.isIdentifier(lookahead_139) || this.isKeyword(lookahead_139)) {
      return this.advance();
    }
    throw this.createError(lookahead_139, "expecting an identifier");
  }
  enforestReturnStatement() {
    let kw_140 = this.advance();
    let lookahead_141 = this.peek();
    if (this.rest.size === 0 || lookahead_141 && !this.lineNumberEq(kw_140, lookahead_141)) {
      return new _terms2.default("ReturnStatement", { expression: null });
    }
    let term_142 = null;
    if (!this.isPunctuator(lookahead_141, ";")) {
      term_142 = this.enforestExpression();
      (0, _errors.expect)(term_142 != null, "Expecting an expression to follow return keyword", lookahead_141, this.rest);
    }
    this.consumeSemicolon();
    return new _terms2.default("ReturnStatement", { expression: term_142 });
  }
  enforestVariableDeclaration() {
    let kind_143;
    let lookahead_144 = this.advance();
    let kindSyn_145 = lookahead_144;
    let phase_146 = this.context.phase;
    if (kindSyn_145 && this.context.env.get(kindSyn_145.resolve(phase_146)) === _transforms.VariableDeclTransform) {
      kind_143 = "var";
    } else if (kindSyn_145 && this.context.env.get(kindSyn_145.resolve(phase_146)) === _transforms.LetDeclTransform) {
      kind_143 = "let";
    } else if (kindSyn_145 && this.context.env.get(kindSyn_145.resolve(phase_146)) === _transforms.ConstDeclTransform) {
      kind_143 = "const";
    } else if (kindSyn_145 && this.context.env.get(kindSyn_145.resolve(phase_146)) === _transforms.SyntaxDeclTransform) {
      kind_143 = "syntax";
    } else if (kindSyn_145 && this.context.env.get(kindSyn_145.resolve(phase_146)) === _transforms.SyntaxrecDeclTransform) {
      kind_143 = "syntaxrec";
    }
    let decls_147 = (0, _immutable.List)();
    while (true) {
      let term = this.enforestVariableDeclarator({ isSyntax: kind_143 === "syntax" || kind_143 === "syntaxrec" });
      let lookahead_144 = this.peek();
      decls_147 = decls_147.concat(term);
      if (this.isPunctuator(lookahead_144, ",")) {
        this.advance();
      } else {
        break;
      }
    }
    return new _terms2.default("VariableDeclaration", { kind: kind_143, declarators: decls_147 });
  }
  enforestVariableDeclarator(_ref4) {
    let isSyntax = _ref4.isSyntax;

    let id_148 = this.enforestBindingTarget({ allowPunctuator: isSyntax });
    let lookahead_149 = this.peek();
    let init_150, rest_151;
    if (this.isPunctuator(lookahead_149, "=")) {
      this.advance();
      let enf = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
      init_150 = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init_150 = null;
    }
    return new _terms2.default("VariableDeclarator", { binding: id_148, init: init_150 });
  }
  enforestExpressionStatement() {
    let start_152 = this.rest.get(0);
    let expr_153 = this.enforestExpression();
    if (expr_153 === null) {
      throw this.createError(start_152, "not a valid expression");
    }
    this.consumeSemicolon();
    return new _terms2.default("ExpressionStatement", { expression: expr_153 });
  }
  enforestExpression() {
    let left_154 = this.enforestExpressionLoop();
    let lookahead_155 = this.peek();
    if (this.isPunctuator(lookahead_155, ",")) {
      while (this.rest.size !== 0) {
        if (!this.isPunctuator(this.peek(), ",")) {
          break;
        }
        let operator = this.advance();
        let right = this.enforestExpressionLoop();
        left_154 = new _terms2.default("BinaryExpression", { left: left_154, operator: operator, right: right });
      }
    }
    this.term = null;
    return left_154;
  }
  enforestExpressionLoop() {
    this.term = null;
    this.opCtx = { prec: 0, combine: x_156 => x_156, stack: (0, _immutable.List)() };
    do {
      let term = this.enforestAssignmentExpression();
      if (term === EXPR_LOOP_NO_CHANGE_42 && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);

        var _opCtx$stack$last = this.opCtx.stack.last();

        let prec = _opCtx$stack$last.prec;
        let combine = _opCtx$stack$last.combine;

        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      } else if (term === EXPR_LOOP_NO_CHANGE_42) {
        break;
      } else if (term === EXPR_LOOP_OPERATOR_41 || term === EXPR_LOOP_EXPANSION_43) {
        this.term = null;
      } else {
        this.term = term;
      }
    } while (true);
    return this.term;
  }
  enforestAssignmentExpression() {
    let lookahead_157 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_157)) {
      this.expandMacro();
      lookahead_157 = this.peek();
    }
    if (this.term === null && this.isTerm(lookahead_157)) {
      return this.advance();
    }
    if (this.term === null && this.isKeyword(lookahead_157, "yield")) {
      return this.enforestYieldExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_157, "class")) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && (this.isIdentifier(lookahead_157) || this.isParens(lookahead_157)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_157, this.peek(1))) {
      return this.enforestArrowExpression();
    }
    if (this.term === null && this.isSyntaxTemplate(lookahead_157)) {
      return this.enforestSyntaxTemplate();
    }
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead_157)) {
      return this.enforestSyntaxQuote();
    }
    if (this.term === null && this.isParens(lookahead_157)) {
      return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
    }
    if (this.term === null && (this.isKeyword(lookahead_157, "this") || this.isIdentifier(lookahead_157) || this.isKeyword(lookahead_157, "let") || this.isKeyword(lookahead_157, "yield") || this.isNumericLiteral(lookahead_157) || this.isStringLiteral(lookahead_157) || this.isTemplate(lookahead_157) || this.isBooleanLiteral(lookahead_157) || this.isNullLiteral(lookahead_157) || this.isRegularExpression(lookahead_157) || this.isFnDeclTransform(lookahead_157) || this.isBraces(lookahead_157) || this.isBrackets(lookahead_157))) {
      return this.enforestPrimaryExpression();
    }
    if (this.term === null && this.isOperator(lookahead_157)) {
      return this.enforestUnaryExpression();
    }
    if (this.term === null && this.isVarBindingTransform(lookahead_157)) {
      let id = this.getFromCompiletimeEnvironment(lookahead_157).id;
      if (id !== lookahead_157) {
        this.advance();
        this.rest = _immutable.List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION_43;
      }
    }
    if (this.term === null && (this.isNewTransform(lookahead_157) || this.isKeyword(lookahead_157, "super")) || this.term && (this.isPunctuator(lookahead_157, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1))) || this.isBrackets(lookahead_157) || this.isParens(lookahead_157))) {
      return this.enforestLeftHandSideExpression({ allowCall: true });
    }
    if (this.term && this.isTemplate(lookahead_157)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term && this.isUpdateOperator(lookahead_157)) {
      return this.enforestUpdateExpression();
    }
    if (this.term && this.isOperator(lookahead_157)) {
      return this.enforestBinaryExpression();
    }
    if (this.term && this.isAssign(lookahead_157)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.advance();
      let enf = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
      let init = enf.enforest("expression");
      this.rest = enf.rest;
      if (op.val() === "=") {
        return new _terms2.default("AssignmentExpression", { binding: binding, expression: init });
      } else {
        return new _terms2.default("CompoundAssignmentExpression", { binding: binding, operator: op.val(), expression: init });
      }
    }
    if (this.term && this.isPunctuator(lookahead_157, "?")) {
      return this.enforestConditionalExpression();
    }
    return EXPR_LOOP_NO_CHANGE_42;
  }
  enforestPrimaryExpression() {
    let lookahead_158 = this.peek();
    if (this.term === null && this.isKeyword(lookahead_158, "this")) {
      return this.enforestThisExpression();
    }
    if (this.term === null && (this.isIdentifier(lookahead_158) || this.isKeyword(lookahead_158, "let") || this.isKeyword(lookahead_158, "yield"))) {
      return this.enforestIdentifierExpression();
    }
    if (this.term === null && this.isNumericLiteral(lookahead_158)) {
      return this.enforestNumericLiteral();
    }
    if (this.term === null && this.isStringLiteral(lookahead_158)) {
      return this.enforestStringLiteral();
    }
    if (this.term === null && this.isTemplate(lookahead_158)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term === null && this.isBooleanLiteral(lookahead_158)) {
      return this.enforestBooleanLiteral();
    }
    if (this.term === null && this.isNullLiteral(lookahead_158)) {
      return this.enforestNullLiteral();
    }
    if (this.term === null && this.isRegularExpression(lookahead_158)) {
      return this.enforestRegularExpressionLiteral();
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_158)) {
      return this.enforestFunctionExpression();
    }
    if (this.term === null && this.isBraces(lookahead_158)) {
      return this.enforestObjectExpression();
    }
    if (this.term === null && this.isBrackets(lookahead_158)) {
      return this.enforestArrayExpression();
    }
    (0, _errors.assert)(false, "Not a primary expression");
  }
  enforestLeftHandSideExpression(_ref5) {
    let allowCall = _ref5.allowCall;

    let lookahead_159 = this.peek();
    if (this.isKeyword(lookahead_159, "super")) {
      this.advance();
      this.term = new _terms2.default("Super", {});
    } else if (this.isNewTransform(lookahead_159)) {
      this.term = this.enforestNewExpression();
    }
    while (true) {
      lookahead_159 = this.peek();
      if (this.isParens(lookahead_159)) {
        if (!allowCall) {
          if (this.term && (0, _terms.isIdentifierExpression)(this.term)) {
            return this.term;
          }
          this.term = this.enforestExpressionLoop();
        } else {
          this.term = this.enforestCallExpression();
        }
      } else if (this.isBrackets(lookahead_159)) {
        this.term = allowCall ? this.enforestComputedMemberExpression() : this.enforestExpressionLoop();
      } else if (this.isPunctuator(lookahead_159, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        this.term = this.enforestStaticMemberExpression();
      } else if (this.isTemplate(lookahead_159)) {
        this.term = this.enforestTemplateLiteral();
      } else if (this.isBraces(lookahead_159)) {
        this.term = this.enforestPrimaryExpression();
      } else if (this.isIdentifier(lookahead_159)) {
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
    let num_160 = this.advance();
    if (num_160.val() === 1 / 0) {
      return new _terms2.default("LiteralInfinityExpression", {});
    }
    return new _terms2.default("LiteralNumericExpression", { value: num_160 });
  }
  enforestIdentifierExpression() {
    return new _terms2.default("IdentifierExpression", { name: this.advance() });
  }
  enforestRegularExpressionLiteral() {
    let reStx_161 = this.advance();
    let lastSlash_162 = reStx_161.token.value.lastIndexOf("/");
    let pattern_163 = reStx_161.token.value.slice(1, lastSlash_162);
    let flags_164 = reStx_161.token.value.slice(lastSlash_162 + 1);
    return new _terms2.default("LiteralRegExpExpression", { pattern: pattern_163, flags: flags_164 });
  }
  enforestNullLiteral() {
    this.advance();
    return new _terms2.default("LiteralNullExpression", {});
  }
  enforestThisExpression() {
    return new _terms2.default("ThisExpression", { stx: this.advance() });
  }
  enforestArgumentList() {
    let result_165 = [];
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
      result_165.push(arg);
    }
    return (0, _immutable.List)(result_165);
  }
  enforestNewExpression() {
    this.matchKeyword("new");
    if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
      this.advance();
      this.advance();
      return new _terms2.default("NewTargetExpression", {});
    }
    let callee_166 = this.enforestLeftHandSideExpression({ allowCall: false });
    let args_167;
    if (this.isParens(this.peek())) {
      args_167 = this.matchParens();
    } else {
      args_167 = (0, _immutable.List)();
    }
    return new _terms2.default("NewExpression", { callee: callee_166, arguments: args_167 });
  }
  enforestComputedMemberExpression() {
    let enf_168 = new Enforester_44(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_168.enforestExpression() });
  }
  transformDestructuring(term_169) {
    switch (term_169.type) {
      case "IdentifierExpression":
        return new _terms2.default("BindingIdentifier", { name: term_169.name });
      case "ParenthesizedExpression":
        if (term_169.inner.size === 1 && this.isIdentifier(term_169.inner.get(0))) {
          return new _terms2.default("BindingIdentifier", { name: term_169.inner.get(0) });
        }
      case "DataProperty":
        return new _terms2.default("BindingPropertyProperty", { name: term_169.name, binding: this.transformDestructuringWithDefault(term_169.expression) });
      case "ShorthandProperty":
        return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_169.name }), init: null });
      case "ObjectExpression":
        return new _terms2.default("ObjectBinding", { properties: term_169.properties.map(t_170 => this.transformDestructuring(t_170)) });
      case "ArrayExpression":
        let last = term_169.elements.last();
        if (last != null && last.type === "SpreadElement") {
          return new _terms2.default("ArrayBinding", { elements: term_169.elements.slice(0, -1).map(t_171 => t_171 && this.transformDestructuringWithDefault(t_171)), restElement: this.transformDestructuringWithDefault(last.expression) });
        } else {
          return new _terms2.default("ArrayBinding", { elements: term_169.elements.map(t_172 => t_172 && this.transformDestructuringWithDefault(t_172)), restElement: null });
        }
        return new _terms2.default("ArrayBinding", { elements: term_169.elements.map(t_173 => t_173 && this.transformDestructuring(t_173)), restElement: null });
      case "StaticPropertyName":
        return new _terms2.default("BindingIdentifier", { name: term_169.value });
      case "ComputedMemberExpression":
      case "StaticMemberExpression":
      case "ArrayBinding":
      case "BindingIdentifier":
      case "BindingPropertyIdentifier":
      case "BindingPropertyProperty":
      case "BindingWithDefault":
      case "ObjectBinding":
        return term_169;
    }
    (0, _errors.assert)(false, "not implemented yet for " + term_169.type);
  }
  transformDestructuringWithDefault(term_174) {
    switch (term_174.type) {
      case "AssignmentExpression":
        return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_174.binding), init: term_174.expression });
    }
    return this.transformDestructuring(term_174);
  }
  enforestCallExpression() {
    let paren_175 = this.advance();
    return new _terms2.default("CallExpression", { callee: this.term, arguments: paren_175.inner() });
  }
  enforestArrowExpression() {
    let enf_176;
    if (this.isIdentifier(this.peek())) {
      enf_176 = new Enforester_44(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf_176 = new Enforester_44(p, (0, _immutable.List)(), this.context);
    }
    let params_177 = enf_176.enforestFormalParameters();
    this.matchPunctuator("=>");
    let body_178;
    if (this.isBraces(this.peek())) {
      body_178 = this.matchCurlies();
    } else {
      enf_176 = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
      body_178 = enf_176.enforestExpressionLoop();
      this.rest = enf_176.rest;
    }
    return new _terms2.default("ArrowExpression", { params: params_177, body: body_178 });
  }
  enforestYieldExpression() {
    let kwd_179 = this.matchKeyword("yield");
    let lookahead_180 = this.peek();
    if (this.rest.size === 0 || lookahead_180 && !this.lineNumberEq(kwd_179, lookahead_180)) {
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
    let name_181 = this.advance();
    return new _terms2.default("SyntaxQuote", { name: name_181, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_181 }), elements: this.enforestTemplateElements() }) });
  }
  enforestStaticMemberExpression() {
    let object_182 = this.term;
    let dot_183 = this.advance();
    let property_184 = this.advance();
    return new _terms2.default("StaticMemberExpression", { object: object_182, property: property_184 });
  }
  enforestArrayExpression() {
    let arr_185 = this.advance();
    let elements_186 = [];
    let enf_187 = new Enforester_44(arr_185.inner(), (0, _immutable.List)(), this.context);
    while (enf_187.rest.size > 0) {
      let lookahead = enf_187.peek();
      if (enf_187.isPunctuator(lookahead, ",")) {
        enf_187.advance();
        elements_186.push(null);
      } else if (enf_187.isPunctuator(lookahead, "...")) {
        enf_187.advance();
        let expression = enf_187.enforestExpressionLoop();
        if (expression == null) {
          throw enf_187.createError(lookahead, "expecting expression");
        }
        elements_186.push(new _terms2.default("SpreadElement", { expression: expression }));
      } else {
        let term = enf_187.enforestExpressionLoop();
        if (term == null) {
          throw enf_187.createError(lookahead, "expected expression");
        }
        elements_186.push(term);
        enf_187.consumeComma();
      }
    }
    return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_186) });
  }
  enforestObjectExpression() {
    let obj_188 = this.advance();
    let properties_189 = (0, _immutable.List)();
    let enf_190 = new Enforester_44(obj_188.inner(), (0, _immutable.List)(), this.context);
    let lastProp_191 = null;
    while (enf_190.rest.size > 0) {
      let prop = enf_190.enforestPropertyDefinition();
      enf_190.consumeComma();
      properties_189 = properties_189.concat(prop);
      if (lastProp_191 === prop) {
        throw enf_190.createError(prop, "invalid syntax in object");
      }
      lastProp_191 = prop;
    }
    return new _terms2.default("ObjectExpression", { properties: properties_189 });
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
    let expr_192 = this.enforestExpressionLoop();
    return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_192 });
  }
  enforestMethodDefinition() {
    let lookahead_193 = this.peek();
    let isGenerator_194 = false;
    if (this.isPunctuator(lookahead_193, "*")) {
      isGenerator_194 = true;
      this.advance();
    }
    if (this.isIdentifier(lookahead_193, "get") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Getter", { name: name, body: body }), kind: "method" };
    } else if (this.isIdentifier(lookahead_193, "set") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName3 = this.enforestPropertyName();

      let name = _enforestPropertyName3.name;

      let enf = new Enforester_44(this.matchParens(), (0, _immutable.List)(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Setter", { name: name, param: param, body: body }), kind: "method" };
    }

    var _enforestPropertyName4 = this.enforestPropertyName();

    let name = _enforestPropertyName4.name;

    if (this.isParens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester_44(params, (0, _immutable.List)(), this.context);
      let formalParams = enf.enforestFormalParameters();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_194, name: name, params: formalParams, body: body }), kind: "method" };
    }
    return { methodOrKey: name, kind: this.isIdentifier(lookahead_193) || this.isKeyword(lookahead_193) ? "identifier" : "property" };
  }
  enforestPropertyName() {
    let lookahead_195 = this.peek();
    if (this.isStringLiteral(lookahead_195) || this.isNumericLiteral(lookahead_195)) {
      return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
    } else if (this.isBrackets(lookahead_195)) {
      let enf = new Enforester_44(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
    }
    let name_196 = this.advance();
    return { name: new _terms2.default("StaticPropertyName", { value: name_196 }), binding: new _terms2.default("BindingIdentifier", { name: name_196 }) };
  }
  enforestFunction(_ref6) {
    let isExpr = _ref6.isExpr;
    let inDefault = _ref6.inDefault;
    let allowGenerator = _ref6.allowGenerator;

    let name_197 = null,
        params_198,
        body_199,
        rest_200;
    let isGenerator_201 = false;
    let fnKeyword_202 = this.advance();
    let lookahead_203 = this.peek();
    let type_204 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
    if (this.isPunctuator(lookahead_203, "*")) {
      isGenerator_201 = true;
      this.advance();
      lookahead_203 = this.peek();
    }
    if (!this.isParens(lookahead_203)) {
      name_197 = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name_197 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_202) });
    }
    params_198 = this.matchParens();
    body_199 = this.matchCurlies();
    let enf_205 = new Enforester_44(params_198, (0, _immutable.List)(), this.context);
    let formalParams_206 = enf_205.enforestFormalParameters();
    return new _terms2.default(type_204, { name: name_197, isGenerator: isGenerator_201, params: formalParams_206, body: body_199 });
  }
  enforestFunctionExpression() {
    let name_207 = null,
        params_208,
        body_209,
        rest_210;
    let isGenerator_211 = false;
    this.advance();
    let lookahead_212 = this.peek();
    if (this.isPunctuator(lookahead_212, "*")) {
      isGenerator_211 = true;
      this.advance();
      lookahead_212 = this.peek();
    }
    if (!this.isParens(lookahead_212)) {
      name_207 = this.enforestBindingIdentifier();
    }
    params_208 = this.matchParens();
    body_209 = this.matchCurlies();
    let enf_213 = new Enforester_44(params_208, (0, _immutable.List)(), this.context);
    let formalParams_214 = enf_213.enforestFormalParameters();
    return new _terms2.default("FunctionExpression", { name: name_207, isGenerator: isGenerator_211, params: formalParams_214, body: body_209 });
  }
  enforestFunctionDeclaration() {
    let name_215, params_216, body_217, rest_218;
    let isGenerator_219 = false;
    this.advance();
    let lookahead_220 = this.peek();
    if (this.isPunctuator(lookahead_220, "*")) {
      isGenerator_219 = true;
      this.advance();
    }
    name_215 = this.enforestBindingIdentifier();
    params_216 = this.matchParens();
    body_217 = this.matchCurlies();
    let enf_221 = new Enforester_44(params_216, (0, _immutable.List)(), this.context);
    let formalParams_222 = enf_221.enforestFormalParameters();
    return new _terms2.default("FunctionDeclaration", { name: name_215, isGenerator: isGenerator_219, params: formalParams_222, body: body_217 });
  }
  enforestFormalParameters() {
    let items_223 = [];
    let rest_224 = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, "...")) {
        this.matchPunctuator("...");
        rest_224 = this.enforestBindingIdentifier();
        break;
      }
      items_223.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_223), rest: rest_224 });
  }
  enforestParam() {
    return this.enforestBindingElement();
  }
  enforestUpdateExpression() {
    let operator_225 = this.matchUnaryOperator();
    return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_225.val(), operand: this.transformDestructuring(this.term) });
  }
  enforestUnaryExpression() {
    let operator_226 = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm_227 => {
      let type_228, term_229, isPrefix_230;
      if (operator_226.val() === "++" || operator_226.val() === "--") {
        type_228 = "UpdateExpression";
        term_229 = this.transformDestructuring(rightTerm_227);
        isPrefix_230 = true;
      } else {
        type_228 = "UnaryExpression";
        isPrefix_230 = undefined;
        term_229 = rightTerm_227;
      }
      return new _terms2.default(type_228, { operator: operator_226.val(), operand: term_229, isPrefix: isPrefix_230 });
    };
    return EXPR_LOOP_OPERATOR_41;
  }
  enforestConditionalExpression() {
    let test_231 = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }
    this.matchPunctuator("?");
    let enf_232 = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
    let consequent_233 = enf_232.enforestExpressionLoop();
    enf_232.matchPunctuator(":");
    enf_232 = new Enforester_44(enf_232.rest, (0, _immutable.List)(), this.context);
    let alternate_234 = enf_232.enforestExpressionLoop();
    this.rest = enf_232.rest;
    return new _terms2.default("ConditionalExpression", { test: test_231, consequent: consequent_233, alternate: alternate_234 });
  }
  enforestBinaryExpression() {
    let leftTerm_235 = this.term;
    let opStx_236 = this.peek();
    let op_237 = opStx_236.val();
    let opPrec_238 = (0, _operators.getOperatorPrec)(op_237);
    let opAssoc_239 = (0, _operators.getOperatorAssoc)(op_237);
    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_238, opAssoc_239)) {
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = opPrec_238;
      this.opCtx.combine = rightTerm_240 => {
        return new _terms2.default("BinaryExpression", { left: leftTerm_235, operator: opStx_236, right: rightTerm_240 });
      };
      this.advance();
      return EXPR_LOOP_OPERATOR_41;
    } else {
      let term = this.opCtx.combine(leftTerm_235);

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
    let lookahead_241 = this.matchTemplate();
    let elements_242 = lookahead_241.token.items.map(it_243 => {
      if (it_243 instanceof _syntax2.default && it_243.isDelimiter()) {
        let enf = new Enforester_44(it_243.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default("TemplateElement", { rawValue: it_243.slice.text });
    });
    return elements_242;
  }
  expandMacro() {
    let lookahead_244 = this.peek();
    while (this.isCompiletimeTransform(lookahead_244)) {
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
      result = result.map(stx_245 => {
        if (!(stx_245 && typeof stx_245.addScope === "function")) {
          throw this.createError(name, "macro must return syntax objects or terms but got: " + stx_245);
        }
        return stx_245.addScope(introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
      });
      this.rest = result.concat(ctx._rest(this));
      lookahead_244 = this.peek();
    }
  }
  consumeSemicolon() {
    let lookahead_246 = this.peek();
    if (lookahead_246 && this.isPunctuator(lookahead_246, ";")) {
      this.advance();
    }
  }
  consumeComma() {
    let lookahead_247 = this.peek();
    if (lookahead_247 && this.isPunctuator(lookahead_247, ",")) {
      this.advance();
    }
  }
  isTerm(term_248) {
    return term_248 && term_248 instanceof _terms2.default;
  }
  isEOF(term_249) {
    return term_249 && term_249 instanceof _syntax2.default && term_249.isEOF();
  }
  isIdentifier(term_250) {
    let val_251 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_250 && term_250 instanceof _syntax2.default && term_250.isIdentifier() && (val_251 === null || term_250.val() === val_251);
  }
  isPropertyName(term_252) {
    return this.isIdentifier(term_252) || this.isKeyword(term_252) || this.isNumericLiteral(term_252) || this.isStringLiteral(term_252) || this.isBrackets(term_252);
  }
  isNumericLiteral(term_253) {
    return term_253 && term_253 instanceof _syntax2.default && term_253.isNumericLiteral();
  }
  isStringLiteral(term_254) {
    return term_254 && term_254 instanceof _syntax2.default && term_254.isStringLiteral();
  }
  isTemplate(term_255) {
    return term_255 && term_255 instanceof _syntax2.default && term_255.isTemplate();
  }
  isBooleanLiteral(term_256) {
    return term_256 && term_256 instanceof _syntax2.default && term_256.isBooleanLiteral();
  }
  isNullLiteral(term_257) {
    return term_257 && term_257 instanceof _syntax2.default && term_257.isNullLiteral();
  }
  isRegularExpression(term_258) {
    return term_258 && term_258 instanceof _syntax2.default && term_258.isRegularExpression();
  }
  isParens(term_259) {
    return term_259 && term_259 instanceof _syntax2.default && term_259.isParens();
  }
  isBraces(term_260) {
    return term_260 && term_260 instanceof _syntax2.default && term_260.isBraces();
  }
  isBrackets(term_261) {
    return term_261 && term_261 instanceof _syntax2.default && term_261.isBrackets();
  }
  isAssign(term_262) {
    if (this.isPunctuator(term_262)) {
      switch (term_262.val()) {
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
  isKeyword(term_263) {
    let val_264 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_263 && term_263 instanceof _syntax2.default && term_263.isKeyword() && (val_264 === null || term_263.val() === val_264);
  }
  isPunctuator(term_265) {
    let val_266 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_265 && term_265 instanceof _syntax2.default && term_265.isPunctuator() && (val_266 === null || term_265.val() === val_266);
  }
  isOperator(term_267) {
    return term_267 && term_267 instanceof _syntax2.default && (0, _operators.isOperator)(term_267);
  }
  isUpdateOperator(term_268) {
    return term_268 && term_268 instanceof _syntax2.default && term_268.isPunctuator() && (term_268.val() === "++" || term_268.val() === "--");
  }
  isFnDeclTransform(term_269) {
    return term_269 && term_269 instanceof _syntax2.default && this.context.env.get(term_269.resolve(this.context.phase)) === _transforms.FunctionDeclTransform;
  }
  isVarDeclTransform(term_270) {
    return term_270 && term_270 instanceof _syntax2.default && this.context.env.get(term_270.resolve(this.context.phase)) === _transforms.VariableDeclTransform;
  }
  isLetDeclTransform(term_271) {
    return term_271 && term_271 instanceof _syntax2.default && this.context.env.get(term_271.resolve(this.context.phase)) === _transforms.LetDeclTransform;
  }
  isConstDeclTransform(term_272) {
    return term_272 && term_272 instanceof _syntax2.default && this.context.env.get(term_272.resolve(this.context.phase)) === _transforms.ConstDeclTransform;
  }
  isSyntaxDeclTransform(term_273) {
    return term_273 && term_273 instanceof _syntax2.default && this.context.env.get(term_273.resolve(this.context.phase)) === _transforms.SyntaxDeclTransform;
  }
  isSyntaxrecDeclTransform(term_274) {
    return term_274 && term_274 instanceof _syntax2.default && this.context.env.get(term_274.resolve(this.context.phase)) === _transforms.SyntaxrecDeclTransform;
  }
  isSyntaxTemplate(term_275) {
    return term_275 && term_275 instanceof _syntax2.default && term_275.isSyntaxTemplate();
  }
  isSyntaxQuoteTransform(term_276) {
    return term_276 && term_276 instanceof _syntax2.default && this.context.env.get(term_276.resolve(this.context.phase)) === _transforms.SyntaxQuoteTransform;
  }
  isReturnStmtTransform(term_277) {
    return term_277 && term_277 instanceof _syntax2.default && this.context.env.get(term_277.resolve(this.context.phase)) === _transforms.ReturnStatementTransform;
  }
  isWhileTransform(term_278) {
    return term_278 && term_278 instanceof _syntax2.default && this.context.env.get(term_278.resolve(this.context.phase)) === _transforms.WhileTransform;
  }
  isForTransform(term_279) {
    return term_279 && term_279 instanceof _syntax2.default && this.context.env.get(term_279.resolve(this.context.phase)) === _transforms.ForTransform;
  }
  isSwitchTransform(term_280) {
    return term_280 && term_280 instanceof _syntax2.default && this.context.env.get(term_280.resolve(this.context.phase)) === _transforms.SwitchTransform;
  }
  isBreakTransform(term_281) {
    return term_281 && term_281 instanceof _syntax2.default && this.context.env.get(term_281.resolve(this.context.phase)) === _transforms.BreakTransform;
  }
  isContinueTransform(term_282) {
    return term_282 && term_282 instanceof _syntax2.default && this.context.env.get(term_282.resolve(this.context.phase)) === _transforms.ContinueTransform;
  }
  isDoTransform(term_283) {
    return term_283 && term_283 instanceof _syntax2.default && this.context.env.get(term_283.resolve(this.context.phase)) === _transforms.DoTransform;
  }
  isDebuggerTransform(term_284) {
    return term_284 && term_284 instanceof _syntax2.default && this.context.env.get(term_284.resolve(this.context.phase)) === _transforms.DebuggerTransform;
  }
  isWithTransform(term_285) {
    return term_285 && term_285 instanceof _syntax2.default && this.context.env.get(term_285.resolve(this.context.phase)) === _transforms.WithTransform;
  }
  isTryTransform(term_286) {
    return term_286 && term_286 instanceof _syntax2.default && this.context.env.get(term_286.resolve(this.context.phase)) === _transforms.TryTransform;
  }
  isThrowTransform(term_287) {
    return term_287 && term_287 instanceof _syntax2.default && this.context.env.get(term_287.resolve(this.context.phase)) === _transforms.ThrowTransform;
  }
  isIfTransform(term_288) {
    return term_288 && term_288 instanceof _syntax2.default && this.context.env.get(term_288.resolve(this.context.phase)) === _transforms.IfTransform;
  }
  isNewTransform(term_289) {
    return term_289 && term_289 instanceof _syntax2.default && this.context.env.get(term_289.resolve(this.context.phase)) === _transforms.NewTransform;
  }
  isCompiletimeTransform(term_290) {
    return term_290 && term_290 instanceof _syntax2.default && (this.context.env.get(term_290.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_290.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform);
  }
  isVarBindingTransform(term_291) {
    return term_291 && term_291 instanceof _syntax2.default && (this.context.env.get(term_291.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform || this.context.store.get(term_291.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform);
  }
  getFromCompiletimeEnvironment(term_292) {
    if (this.context.env.has(term_292.resolve(this.context.phase))) {
      return this.context.env.get(term_292.resolve(this.context.phase));
    }
    return this.context.store.get(term_292.resolve(this.context.phase));
  }
  lineNumberEq(a_293, b_294) {
    if (!(a_293 && b_294)) {
      return false;
    }
    return a_293.lineNumber() === b_294.lineNumber();
  }
  matchIdentifier(val_295) {
    let lookahead_296 = this.advance();
    if (this.isIdentifier(lookahead_296)) {
      return lookahead_296;
    }
    throw this.createError(lookahead_296, "expecting an identifier");
  }
  matchKeyword(val_297) {
    let lookahead_298 = this.advance();
    if (this.isKeyword(lookahead_298, val_297)) {
      return lookahead_298;
    }
    throw this.createError(lookahead_298, "expecting " + val_297);
  }
  matchLiteral() {
    let lookahead_299 = this.advance();
    if (this.isNumericLiteral(lookahead_299) || this.isStringLiteral(lookahead_299) || this.isBooleanLiteral(lookahead_299) || this.isNullLiteral(lookahead_299) || this.isTemplate(lookahead_299) || this.isRegularExpression(lookahead_299)) {
      return lookahead_299;
    }
    throw this.createError(lookahead_299, "expecting a literal");
  }
  matchStringLiteral() {
    let lookahead_300 = this.advance();
    if (this.isStringLiteral(lookahead_300)) {
      return lookahead_300;
    }
    throw this.createError(lookahead_300, "expecting a string literal");
  }
  matchTemplate() {
    let lookahead_301 = this.advance();
    if (this.isTemplate(lookahead_301)) {
      return lookahead_301;
    }
    throw this.createError(lookahead_301, "expecting a template literal");
  }
  matchParens() {
    let lookahead_302 = this.advance();
    if (this.isParens(lookahead_302)) {
      return lookahead_302.inner();
    }
    throw this.createError(lookahead_302, "expecting parens");
  }
  matchCurlies() {
    let lookahead_303 = this.advance();
    if (this.isBraces(lookahead_303)) {
      return lookahead_303.inner();
    }
    throw this.createError(lookahead_303, "expecting curly braces");
  }
  matchSquares() {
    let lookahead_304 = this.advance();
    if (this.isBrackets(lookahead_304)) {
      return lookahead_304.inner();
    }
    throw this.createError(lookahead_304, "expecting sqaure braces");
  }
  matchUnaryOperator() {
    let lookahead_305 = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead_305)) {
      return lookahead_305;
    }
    throw this.createError(lookahead_305, "expecting a unary operator");
  }
  matchPunctuator(val_306) {
    let lookahead_307 = this.advance();
    if (this.isPunctuator(lookahead_307)) {
      if (typeof val_306 !== "undefined") {
        if (lookahead_307.val() === val_306) {
          return lookahead_307;
        } else {
          throw this.createError(lookahead_307, "expecting a " + val_306 + " punctuator");
        }
      }
      return lookahead_307;
    }
    throw this.createError(lookahead_307, "expecting a punctuator");
  }
  createError(stx_308, message_309) {
    let ctx_310 = "";
    let offending_311 = stx_308;
    if (this.rest.size > 0) {
      ctx_310 = this.rest.slice(0, 20).map(term_312 => {
        if (term_312.isDelimiter()) {
          return term_312.inner();
        }
        return _immutable.List.of(term_312);
      }).flatten().map(s_313 => {
        if (s_313 === offending_311) {
          return "__" + s_313.val() + "__";
        }
        return s_313.val();
      }).join(" ");
    } else {
      ctx_310 = offending_311.toString();
    }
    return new Error(message_309 + "\n" + ctx_310);
  }
}
exports.Enforester = Enforester_44;
//# sourceMappingURL=data:application/json;base64,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LE9BTFMsRUFLUCxPQUxPLEdBS0csR0FMSCxDQUtPLFNBQVM7QUFDeEIsWUFBSSxVQUFVLGFBQWQsRUFBNkI7QUFDM0IsaUJBQU8sT0FBTyxNQUFNLEdBQU4sRUFBUCxHQUFxQixJQUE1QjtBQUNEO0FBQ0QsZUFBTyxNQUFNLEdBQU4sRUFBUDtBQUNELE9BVlMsRUFVUCxJQVZPLENBVUYsR0FWRSxDQUFWO0FBV0QsS0FaRCxNQVlPO0FBQ0wsZ0JBQVUsY0FBYyxRQUFkLEVBQVY7QUFDRDtBQUNELFdBQU8sSUFBSSxLQUFKLENBQVUsY0FBYyxJQUFkLEdBQXFCLE9BQS9CLENBQVA7QUFDRDtBQXRrRGlCO1FBd2tESyxVLEdBQWpCLGEiLCJmaWxlIjoiZW5mb3Jlc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtLCB7aXNJZGVudGlmaWVyRXhwcmVzc2lvbn0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7RnVuY3Rpb25EZWNsVHJhbnNmb3JtLCBWYXJpYWJsZURlY2xUcmFuc2Zvcm0sIE5ld1RyYW5zZm9ybSwgTGV0RGVjbFRyYW5zZm9ybSwgQ29uc3REZWNsVHJhbnNmb3JtLCBTeW50YXhEZWNsVHJhbnNmb3JtLCBTeW50YXhyZWNEZWNsVHJhbnNmb3JtLCBTeW50YXhRdW90ZVRyYW5zZm9ybSwgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtLCBXaGlsZVRyYW5zZm9ybSwgSWZUcmFuc2Zvcm0sIEZvclRyYW5zZm9ybSwgU3dpdGNoVHJhbnNmb3JtLCBCcmVha1RyYW5zZm9ybSwgQ29udGludWVUcmFuc2Zvcm0sIERvVHJhbnNmb3JtLCBEZWJ1Z2dlclRyYW5zZm9ybSwgV2l0aFRyYW5zZm9ybSwgVHJ5VHJhbnNmb3JtLCBUaHJvd1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm0sIFZhckJpbmRpbmdUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge2lzT3BlcmF0b3IsIGlzVW5hcnlPcGVyYXRvciwgZ2V0T3BlcmF0b3JBc3NvYywgZ2V0T3BlcmF0b3JQcmVjLCBvcGVyYXRvckx0fSBmcm9tIFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7ZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCB7c2FuaXRpemVSZXBsYWNlbWVudFZhbHVlc30gZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzQxID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQyID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzID0ge307XG5jbGFzcyBFbmZvcmVzdGVyXzQ0IHtcbiAgY29uc3RydWN0b3Ioc3R4bF80NSwgcHJldl80NiwgY29udGV4dF80Nykge1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChzdHhsXzQ1KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChwcmV2XzQ2KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChjb250ZXh0XzQ3LCBcImV4cGVjdGluZyBhIGNvbnRleHQgdG8gZW5mb3Jlc3RcIik7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLnJlc3QgPSBzdHhsXzQ1O1xuICAgIHRoaXMucHJldiA9IHByZXZfNDY7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF80NztcbiAgfVxuICBwZWVrKG5fNDggPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdC5nZXQobl80OCk7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBsZXQgcmV0XzQ5ID0gdGhpcy5yZXN0LmZpcnN0KCk7XG4gICAgdGhpcy5yZXN0ID0gdGhpcy5yZXN0LnJlc3QoKTtcbiAgICByZXR1cm4gcmV0XzQ5O1xuICB9XG4gIGVuZm9yZXN0KHR5cGVfNTAgPSBcIk1vZHVsZVwiKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdF81MTtcbiAgICBpZiAodHlwZV81MCA9PT0gXCJleHByZXNzaW9uXCIpIHtcbiAgICAgIHJlc3VsdF81MSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRfNTEgPSB0aGlzLmVuZm9yZXN0TW9kdWxlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF81MTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdEJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RNb2R1bGVJdGVtKCk7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGVJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfNTIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzUyLCBcImltcG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTIsIFwiZXhwb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81MiwgXCIjXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdExhbmd1YWdlUHJhZ21hKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYW5ndWFnZVByYWdtYSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcIiNcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJsYW5nXCIpO1xuICAgIGxldCBwYXRoXzUzID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJQcmFnbWFcIiwge2tpbmQ6IFwibGFuZ1wiLCBpdGVtczogTGlzdC5vZihwYXRoXzUzKX0pO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF81NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTQsIFwiKlwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF81NCkpIHtcbiAgICAgIGxldCBuYW1lZEV4cG9ydHMgPSB0aGlzLmVuZm9yZXN0RXhwb3J0Q2xhdXNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJmcm9tXCIpKSB7XG4gICAgICAgIG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRGcm9tXCIsIHtuYW1lZEV4cG9ydHM6IG5hbWVkRXhwb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NCwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKHRoaXMucGVlaygpKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNsYXNzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiBib2R5fSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTQpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTQpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF81NCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydENsYXVzZSgpIHtcbiAgICBsZXQgZW5mXzU1ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfNTYgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzU1LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzU2LnB1c2goZW5mXzU1LmVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkpO1xuICAgICAgZW5mXzU1LmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNTYpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkge1xuICAgIGxldCBuYW1lXzU3ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGV4cG9ydGVkTmFtZSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNTcsIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgZXhwb3J0ZWROYW1lOiBuYW1lXzU3fSk7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzU4ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGRlZmF1bHRCaW5kaW5nXzU5ID0gbnVsbDtcbiAgICBsZXQgbmFtZWRJbXBvcnRzXzYwID0gTGlzdCgpO1xuICAgIGxldCBmb3JTeW50YXhfNjEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzU4KSkge1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ181OSwgbmFtZWRJbXBvcnRzOiBuYW1lZEltcG9ydHNfNjAsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNTgpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81OCkpIHtcbiAgICAgIGRlZmF1bHRCaW5kaW5nXzU5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGZvclN5bnRheF82MSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNTksIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyLCBuYW1lZEltcG9ydHM6IExpc3QoKSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjF9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICBsb29rYWhlYWRfNTggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNTgpKSB7XG4gICAgICBsZXQgaW1wb3J0cyA9IHRoaXMuZW5mb3Jlc3ROYW1lZEltcG9ydHMoKTtcbiAgICAgIGxldCBmcm9tQ2xhdXNlID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF82MSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ181OSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjEsIG5hbWVkSW1wb3J0czogaW1wb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBmcm9tQ2xhdXNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTgsIFwiKlwiKSkge1xuICAgICAgbGV0IG5hbWVzcGFjZUJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNjEgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNTksIGZvclN5bnRheDogZm9yU3ludGF4XzYxLCBuYW1lc3BhY2VCaW5kaW5nOiBuYW1lc3BhY2VCaW5kaW5nLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF81OCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIqXCIpO1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICB9XG4gIGVuZm9yZXN0TmFtZWRJbXBvcnRzKCkge1xuICAgIGxldCBlbmZfNjIgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF82MyA9IFtdO1xuICAgIHdoaWxlIChlbmZfNjIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfNjMucHVzaChlbmZfNjIuZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkpO1xuICAgICAgZW5mXzYyLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNjMpO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzY0ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG5hbWVfNjU7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82NCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY0KSkge1xuICAgICAgbmFtZV82NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNjV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNjQsIFwidW5leHBlY3RlZCB0b2tlbiBpbiBpbXBvcnQgc3BlY2lmaWVyXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNjUsIGJpbmRpbmc6IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGcm9tQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiZnJvbVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzY2ID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbG9va2FoZWFkXzY2O1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF82NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbih7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50KCkge1xuICAgIGxldCBsb29rYWhlYWRfNjggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICBsb29rYWhlYWRfNjggPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJsb2NrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWZUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZlN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGb3JUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3dpdGNoVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyZWFrVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29udGludWVUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEb1RyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERvU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RlYnVnZ2VyVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2l0aFRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVHJ5VHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VHJ5U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rocm93VHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNjgsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82OCkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIjpcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNjgpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNjgpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF82OCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkVtcHR5U3RhdGVtZW50XCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCkge1xuICAgIGxldCBsYWJlbF82OSA9IHRoaXMubWF0Y2hJZGVudGlmaWVyKCk7XG4gICAgbGV0IHB1bmNfNzAgPSB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IHN0bXRfNzEgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzY5LCBib2R5OiBzdG10XzcxfSk7XG4gIH1cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImJyZWFrXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNzIgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzMgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNzIsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNzIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzIsIFwibGV0XCIpKSB7XG4gICAgICBsYWJlbF83MyA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzN9KTtcbiAgfVxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRyeVwiKTtcbiAgICBsZXQgYm9keV83NCA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXRjaFwiKSkge1xuICAgICAgbGV0IGNhdGNoQ2xhdXNlID0gdGhpcy5lbmZvcmVzdENhdGNoQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzc0LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2UsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogYm9keV83NCwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNzQsIGNhdGNoQ2xhdXNlOiBudWxsLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInRyeSB3aXRoIG5vIGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gIH1cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhdGNoXCIpO1xuICAgIGxldCBiaW5kaW5nUGFyZW5zXzc1ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNzYgPSBuZXcgRW5mb3Jlc3Rlcl80NChiaW5kaW5nUGFyZW5zXzc1LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGJpbmRpbmdfNzcgPSBlbmZfNzYuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGJvZHlfNzggPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogYmluZGluZ183NywgYm9keTogYm9keV83OH0pO1xuICB9XG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0aHJvd1wiKTtcbiAgICBsZXQgZXhwcmVzc2lvbl83OSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb25fNzl9KTtcbiAgfVxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aXRoXCIpO1xuICAgIGxldCBvYmpQYXJlbnNfODAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MSA9IG5ldyBFbmZvcmVzdGVyXzQ0KG9ialBhcmVuc184MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBvYmplY3RfODIgPSBlbmZfODEuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfODMgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7b2JqZWN0OiBvYmplY3RfODIsIGJvZHk6IGJvZHlfODN9KTtcbiAgfVxuICBlbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVidWdnZXJcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGVidWdnZXJTdGF0ZW1lbnRcIiwge30pO1xuICB9XG4gIGVuZm9yZXN0RG9TdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkb1wiKTtcbiAgICBsZXQgYm9keV84NCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCB0ZXN0Qm9keV84NSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzg2ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGVzdEJvZHlfODUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdF84NyA9IGVuZl84Ni5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzg0LCB0ZXN0OiB0ZXN0Xzg3fSk7XG4gIH1cbiAgZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dkXzg4ID0gdGhpcy5tYXRjaEtleXdvcmQoXCJjb250aW51ZVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzg5ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzkwID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzg5LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF85MH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkXzg4LCBsb29rYWhlYWRfODkpICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODkpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84OSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfODksIFwibGV0XCIpKSkge1xuICAgICAgbGFiZWxfOTAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzkwfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJzd2l0Y2hcIik7XG4gICAgbGV0IGNvbmRfOTEgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyXzQ0KGNvbmRfOTEsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZGlzY3JpbWluYW50XzkzID0gZW5mXzkyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5Xzk0ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBpZiAoYm9keV85NC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50XzkzLCBjYXNlczogTGlzdCgpfSk7XG4gICAgfVxuICAgIGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyXzQ0KGJvZHlfOTQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY2FzZXNfOTUgPSBlbmZfOTIuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgIGxldCBsb29rYWhlYWRfOTYgPSBlbmZfOTIucGVlaygpO1xuICAgIGlmIChlbmZfOTIuaXNLZXl3b3JkKGxvb2thaGVhZF85NiwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmZfOTIuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZl85Mi5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfOTMsIHByZURlZmF1bHRDYXNlczogY2FzZXNfOTUsIGRlZmF1bHRDYXNlOiBkZWZhdWx0Q2FzZSwgcG9zdERlZmF1bHRDYXNlczogcG9zdERlZmF1bHRDYXNlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50XzkzLCBjYXNlczogY2FzZXNfOTV9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VzKCkge1xuICAgIGxldCBjYXNlc185NyA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikpKSB7XG4gICAgICBjYXNlc185Ny5wdXNoKHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChjYXNlc185Nyk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2FzZVwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpLCBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCkge1xuICAgIGxldCByZXN1bHRfOTggPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhc2VcIikpKSB7XG4gICAgICByZXN1bHRfOTgucHVzaCh0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF85OCk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVmYXVsdFwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9yU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZm9yXCIpO1xuICAgIGxldCBjb25kXzk5ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTAwID0gbmV3IEVuZm9yZXN0ZXJfNDQoY29uZF85OSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTAxLCB0ZXN0XzEwMiwgaW5pdF8xMDMsIHJpZ2h0XzEwNCwgdHlwZV8xMDUsIGxlZnRfMTA2LCB1cGRhdGVfMTA3O1xuICAgIGlmIChlbmZfMTAwLmlzUHVuY3R1YXRvcihlbmZfMTAwLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mXzEwMC5pc1B1bmN0dWF0b3IoZW5mXzEwMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICB0ZXN0XzEwMiA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICBlbmZfMTAwLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICBpZiAoZW5mXzEwMC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgcmlnaHRfMTA0ID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogbnVsbCwgdGVzdDogdGVzdF8xMDIsIHVwZGF0ZTogcmlnaHRfMTA0LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9va2FoZWFkXzEwMSA9IGVuZl8xMDAucGVlaygpO1xuICAgICAgaWYgKGVuZl8xMDAuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMDEpIHx8IGVuZl8xMDAuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMDEpIHx8IGVuZl8xMDAuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEwMSkpIHtcbiAgICAgICAgaW5pdF8xMDMgPSBlbmZfMTAwLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpO1xuICAgICAgICBsb29rYWhlYWRfMTAxID0gZW5mXzEwMC5wZWVrKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTAxLCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMDEsIFwib2ZcIikpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEwMSwgXCJpblwiKSkge1xuICAgICAgICAgICAgZW5mXzEwMC5hZHZhbmNlKCk7XG4gICAgICAgICAgICByaWdodF8xMDQgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV8xMDUgPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTAxLCBcIm9mXCIpKSB7XG4gICAgICAgICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0XzEwNCA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzEwNSA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1LCB7bGVmdDogaW5pdF8xMDMsIHJpZ2h0OiByaWdodF8xMDQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGVuZl8xMDAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl8xMDAuaXNQdW5jdHVhdG9yKGVuZl8xMDAucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0XzEwMiA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF8xMDIgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl8xMDAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfMTA3ID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChlbmZfMTAwLnBlZWsoMSksIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mXzEwMC5wZWVrKDEpLCBcIm9mXCIpKSB7XG4gICAgICAgICAgbGVmdF8xMDYgPSBlbmZfMTAwLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgICBsZXQga2luZCA9IGVuZl8xMDAuYWR2YW5jZSgpO1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChraW5kLCBcImluXCIpKSB7XG4gICAgICAgICAgICB0eXBlXzEwNSA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHlwZV8xMDUgPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJpZ2h0XzEwNCA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1LCB7bGVmdDogbGVmdF8xMDYsIHJpZ2h0OiByaWdodF8xMDQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGluaXRfMTAzID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgZW5mXzEwMC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzEwMC5pc1B1bmN0dWF0b3IoZW5mXzEwMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl8xMDAuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfMTAyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0XzEwMiA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzEwMC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV8xMDcgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0XzEwMywgdGVzdDogdGVzdF8xMDIsIHVwZGF0ZTogdXBkYXRlXzEwNywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0SWZTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJpZlwiKTtcbiAgICBsZXQgY29uZF8xMDggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl8xMDkgPSBuZXcgRW5mb3Jlc3Rlcl80NChjb25kXzEwOCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTEwID0gZW5mXzEwOS5wZWVrKCk7XG4gICAgbGV0IHRlc3RfMTExID0gZW5mXzEwOS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF8xMTEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl8xMDkuY3JlYXRlRXJyb3IobG9va2FoZWFkXzExMCwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGNvbnNlcXVlbnRfMTEyID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIGxldCBhbHRlcm5hdGVfMTEzID0gbnVsbDtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZWxzZVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBhbHRlcm5hdGVfMTEzID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF8xMTEsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMTEyLCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8xMTN9KTtcbiAgfVxuICBlbmZvcmVzdFdoaWxlU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IGNvbmRfMTE0ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTE1ID0gbmV3IEVuZm9yZXN0ZXJfNDQoY29uZF8xMTQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzExNiA9IGVuZl8xMTUucGVlaygpO1xuICAgIGxldCB0ZXN0XzExNyA9IGVuZl8xMTUuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfMTE3ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfMTE1LmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMTYsIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBib2R5XzExOCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF8xMTcsIGJvZHk6IGJvZHlfMTE4fSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9ja1N0YXRlbWVudCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZW5mb3Jlc3RCbG9jaygpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9jaygpIHtcbiAgICBsZXQgYl8xMTkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBib2R5XzEyMCA9IFtdO1xuICAgIGxldCBlbmZfMTIxID0gbmV3IEVuZm9yZXN0ZXJfNDQoYl8xMTksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEyMS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTIxLnBlZWsoKTtcbiAgICAgIGxldCBzdG10ID0gZW5mXzEyMS5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgaWYgKHN0bXQgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBlbmZfMTIxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJub3QgYSBzdGF0ZW1lbnRcIik7XG4gICAgICB9XG4gICAgICBib2R5XzEyMC5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogTGlzdChib2R5XzEyMCl9KTtcbiAgfVxuICBlbmZvcmVzdENsYXNzKHtpc0V4cHIsIGluRGVmYXVsdH0pIHtcbiAgICBsZXQga3dfMTIyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IG5hbWVfMTIzID0gbnVsbCwgc3Vwcl8xMjQgPSBudWxsO1xuICAgIGxldCB0eXBlXzEyNSA9IGlzRXhwciA/IFwiQ2xhc3NFeHByZXNzaW9uXCIgOiBcIkNsYXNzRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEyMyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoIWlzRXhwcikge1xuICAgICAgaWYgKGluRGVmYXVsdCkge1xuICAgICAgICBuYW1lXzEyMyA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIl9kZWZhdWx0XCIsIGt3XzEyMil9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJleHRlbmRzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN1cHJfMTI0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuICAgIGxldCBlbGVtZW50c18xMjYgPSBbXTtcbiAgICBsZXQgZW5mXzEyNyA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEyNy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGlmIChlbmZfMTI3LmlzUHVuY3R1YXRvcihlbmZfMTI3LnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIGVuZl8xMjcuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaWRlbnRpZmllclwiICYmIG1ldGhvZE9yS2V5LnZhbHVlLnZhbCgpID09PSBcInN0YXRpY1wiKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIGlmIChraW5kID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICAgIGVsZW1lbnRzXzEyNi5wdXNoKG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogaXNTdGF0aWMsIG1ldGhvZDogbWV0aG9kT3JLZXl9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGVuZl8xMjcucGVlaygpLCBcIk9ubHkgbWV0aG9kcyBhcmUgYWxsb3dlZCBpbiBjbGFzc2VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMjUsIHtuYW1lOiBuYW1lXzEyMywgc3VwZXI6IHN1cHJfMTI0LCBlbGVtZW50czogTGlzdChlbGVtZW50c18xMjYpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KHthbGxvd1B1bmN0dWF0b3J9ID0ge30pIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyOCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTI4KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTI4KSB8fCBhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyOCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoe2FsbG93UHVuY3R1YXRvcjogYWxsb3dQdW5jdHVhdG9yfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEyOCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEJpbmRpbmcoKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCkge1xuICAgIGxldCBlbmZfMTI5ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzEzMCA9IFtdO1xuICAgIHdoaWxlIChlbmZfMTI5LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcHJvcGVydGllc18xMzAucHVzaChlbmZfMTI5LmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mXzEyOS5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogTGlzdChwcm9wZXJ0aWVzXzEzMCl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzMSA9IHRoaXMucGVlaygpO1xuICAgIGxldCB7bmFtZSwgYmluZGluZ30gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzEsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzEsIFwieWllbGRcIikpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBleHByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IGJpbmRpbmcsIGluaXQ6IGRlZmF1bHRWYWx1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgYmluZGluZyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiBuYW1lLCBiaW5kaW5nOiBiaW5kaW5nfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXRfMTMyID0gdGhpcy5tYXRjaFNxdWFyZXMoKTtcbiAgICBsZXQgZW5mXzEzMyA9IG5ldyBFbmZvcmVzdGVyXzQ0KGJyYWNrZXRfMTMyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzXzEzNCA9IFtdLCByZXN0RWxlbWVudF8xMzUgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTMzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZl8xMzMuaXNQdW5jdHVhdG9yKGVuZl8xMzMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzEzMy5jb25zdW1lQ29tbWEoKTtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVuZl8xMzMuaXNQdW5jdHVhdG9yKGVuZl8xMzMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICAgIGVuZl8xMzMuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3RFbGVtZW50XzEzNSA9IGVuZl8xMzMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmZfMTMzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTMzLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgICAgZWxlbWVudHNfMTM0LnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEzNCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMzV9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nXzEzNiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICBiaW5kaW5nXzEzNiA9IG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiBiaW5kaW5nXzEzNiwgaW5pdDogaW5pdH0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ18xMzY7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7YWxsb3dQdW5jdHVhdG9yfSA9IHt9KSB7XG4gICAgbGV0IG5hbWVfMTM3O1xuICAgIGlmIChhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEzNyA9IHRoaXMuZW5mb3Jlc3RQdW5jdHVhdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVfMTM3ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTM3fSk7XG4gIH1cbiAgZW5mb3Jlc3RQdW5jdHVhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTM4ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEzOCwgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzOSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM5KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMzksIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3XzE0MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTQxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNDEgJiYgIXRoaXMubGluZU51bWJlckVxKGt3XzE0MCwgbG9va2FoZWFkXzE0MSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH1cbiAgICBsZXQgdGVybV8xNDIgPSBudWxsO1xuICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE0MSwgXCI7XCIpKSB7XG4gICAgICB0ZXJtXzE0MiA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBleHBlY3QodGVybV8xNDIgIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkXzE0MSwgdGhpcy5yZXN0KTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0ZXJtXzE0Mn0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpIHtcbiAgICBsZXQga2luZF8xNDM7XG4gICAgbGV0IGxvb2thaGVhZF8xNDQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQga2luZFN5bl8xNDUgPSBsb29rYWhlYWRfMTQ0O1xuICAgIGxldCBwaGFzZV8xNDYgPSB0aGlzLmNvbnRleHQucGhhc2U7XG4gICAgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDMgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDUgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDUucmVzb2x2ZShwaGFzZV8xNDYpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDMgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDUgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDUucmVzb2x2ZShwaGFzZV8xNDYpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzE0MyA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQzID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQzID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG4gICAgbGV0IGRlY2xzXzE0NyA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheDoga2luZF8xNDMgPT09IFwic3ludGF4XCIgfHwga2luZF8xNDMgPT09IFwic3ludGF4cmVjXCJ9KTtcbiAgICAgIGxldCBsb29rYWhlYWRfMTQ0ID0gdGhpcy5wZWVrKCk7XG4gICAgICBkZWNsc18xNDcgPSBkZWNsc18xNDcuY29uY2F0KHRlcm0pO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDQsIFwiLFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBraW5kXzE0MywgZGVjbGFyYXRvcnM6IGRlY2xzXzE0N30pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheH0pIHtcbiAgICBsZXQgaWRfMTQ4ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcjogaXNTeW50YXh9KTtcbiAgICBsZXQgbG9va2FoZWFkXzE0OSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpbml0XzE1MCwgcmVzdF8xNTE7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDksIFwiPVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBpbml0XzE1MCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdF8xNTAgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IGlkXzE0OCwgaW5pdDogaW5pdF8xNTB9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0XzE1MiA9IHRoaXMucmVzdC5nZXQoMCk7XG4gICAgbGV0IGV4cHJfMTUzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwcl8xNTMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3Ioc3RhcnRfMTUyLCBcIm5vdCBhIHZhbGlkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMTUzfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0XzE1NCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGxldCBsb29rYWhlYWRfMTU1ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNTUsIFwiLFwiKSkge1xuICAgICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgbGVmdF8xNTQgPSBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTU0LCBvcGVyYXRvcjogb3BlcmF0b3IsIHJpZ2h0OiByaWdodH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHJldHVybiBsZWZ0XzE1NDtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtwcmVjOiAwLCBjb21iaW5lOiB4XzE1NiA9PiB4XzE1Niwgc3RhY2s6IExpc3QoKX07XG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQyICYmIHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfNDIpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9PUEVSQVRPUl80MSB8fCB0ZXJtID09PSBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzKSB7XG4gICAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRlcm0gPSB0ZXJtO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE1NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICBsb29rYWhlYWRfMTU3ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU3LCBcInlpZWxkXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTU3KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTcpKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiPT5cIikgJiYgdGhpcy5saW5lTnVtYmVyRXEobG9va2FoZWFkXzE1NywgdGhpcy5wZWVrKDEpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4VGVtcGxhdGUobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4UXVvdGVUcmFuc2Zvcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiLCB7aW5uZXI6IHRoaXMuYWR2YW5jZSgpLmlubmVyKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1NywgXCJ0aGlzXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwieWllbGRcIikgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTU3KSB8fCB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzE1NykgfHwgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTU3KSB8fCB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1NykgfHwgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNTcpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVmFyQmluZGluZ1RyYW5zZm9ybShsb29rYWhlYWRfMTU3KSkge1xuICAgICAgbGV0IGlkID0gdGhpcy5nZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudChsb29rYWhlYWRfMTU3KS5pZDtcbiAgICAgIGlmIChpZCAhPT0gbG9va2FoZWFkXzE1Nykge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5yZXN0ID0gTGlzdC5vZihpZCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwic3VwZXJcIikpIHx8IHRoaXMudGVybSAmJiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NywgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpIHx8IHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU3KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTcpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMZWZ0SGFuZFNpZGVFeHByZXNzaW9uKHthbGxvd0NhbGw6IHRydWV9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1VwZGF0ZU9wZXJhdG9yKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzT3BlcmF0b3IobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NywgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV80MjtcbiAgfVxuICBlbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTU4ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU4LCBcInRoaXNcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhpc0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE1OCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OCwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OCwgXCJ5aWVsZFwiKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE1OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TnVtZXJpY0xpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTU4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdHJpbmdMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xNTgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTU4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCb29sZWFuTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMTU4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3ROdWxsTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTU4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RSZWd1bGFyRXhwcmVzc2lvbkxpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xNTgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIk5vdCBhIHByaW1hcnkgZXhwcmVzc2lvblwiKTtcbiAgfVxuICBlbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oe2FsbG93Q2FsbH0pIHtcbiAgICBsZXQgbG9va2FoZWFkXzE1OSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU5LCBcInN1cGVyXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiU3VwZXJcIiwge30pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc05ld1RyYW5zZm9ybShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxvb2thaGVhZF8xNTkgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTkpKSB7XG4gICAgICAgIGlmICghYWxsb3dDYWxsKSB7XG4gICAgICAgICAgaWYgKHRoaXMudGVybSAmJiBpc0lkZW50aWZpZXJFeHByZXNzaW9uKHRoaXMudGVybSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RDYWxsRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU5KSkge1xuICAgICAgICB0aGlzLnRlcm0gPSBhbGxvd0NhbGwgPyB0aGlzLmVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCkgOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1OSwgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLmVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1OSkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTkpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXJtO1xuICB9XG4gIGVuZm9yZXN0Qm9vbGVhbkxpdGVyYWwoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3RyaW5nTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3ROdW1lcmljTGl0ZXJhbCgpIHtcbiAgICBsZXQgbnVtXzE2MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChudW1fMTYwLnZhbCgpID09PSAxIC8gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiLCB7dmFsdWU6IG51bV8xNjB9KTtcbiAgfVxuICBlbmZvcmVzdElkZW50aWZpZXJFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0UmVndWxhckV4cHJlc3Npb25MaXRlcmFsKCkge1xuICAgIGxldCByZVN0eF8xNjEgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbGFzdFNsYXNoXzE2MiA9IHJlU3R4XzE2MS50b2tlbi52YWx1ZS5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgbGV0IHBhdHRlcm5fMTYzID0gcmVTdHhfMTYxLnRva2VuLnZhbHVlLnNsaWNlKDEsIGxhc3RTbGFzaF8xNjIpO1xuICAgIGxldCBmbGFnc18xNjQgPSByZVN0eF8xNjEudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoXzE2MiArIDEpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCIsIHtwYXR0ZXJuOiBwYXR0ZXJuXzE2MywgZmxhZ3M6IGZsYWdzXzE2NH0pO1xuICB9XG4gIGVuZm9yZXN0TnVsbExpdGVyYWwoKSB7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgfVxuICBlbmZvcmVzdFRoaXNFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRoaXNFeHByZXNzaW9uXCIsIHtzdHg6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcmd1bWVudExpc3QoKSB7XG4gICAgbGV0IHJlc3VsdF8xNjUgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgYXJnO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgYXJnID0gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJnID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLFwiKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdF8xNjUucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMTY1KTtcbiAgfVxuICBlbmZvcmVzdE5ld0V4cHJlc3Npb24oKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJuZXdcIik7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi5cIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInRhcmdldFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIk5ld1RhcmdldEV4cHJlc3Npb25cIiwge30pO1xuICAgIH1cbiAgICBsZXQgY2FsbGVlXzE2NiA9IHRoaXMuZW5mb3Jlc3RMZWZ0SGFuZFNpZGVFeHByZXNzaW9uKHthbGxvd0NhbGw6IGZhbHNlfSk7XG4gICAgbGV0IGFyZ3NfMTY3O1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xNjcgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTY3ID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xNjYsIGFyZ3VtZW50czogYXJnc18xNjd9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE2OCA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTY4LmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE2OSkge1xuICAgIHN3aXRjaCAodGVybV8xNjkudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OS5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTY5LmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xNjkuaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OS5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xNjkubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNjkuZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OS5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTY5LnByb3BlcnRpZXMubWFwKHRfMTcwID0+IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE3MCkpfSk7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIGxldCBsYXN0ID0gdGVybV8xNjkuZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gXCJTcHJlYWRFbGVtZW50XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE2OS5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHRfMTcxID0+IHRfMTcxICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTcxKSksIHJlc3RFbGVtZW50OiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdChsYXN0LmV4cHJlc3Npb24pfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjkuZWxlbWVudHMubWFwKHRfMTcyID0+IHRfMTcyICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTcyKSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjkuZWxlbWVudHMubWFwKHRfMTczID0+IHRfMTczICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE3MykpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgY2FzZSBcIlN0YXRpY1Byb3BlcnR5TmFtZVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNjkudmFsdWV9KTtcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQXJyYXlCaW5kaW5nXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ0lkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nV2l0aERlZmF1bHRcIjpcbiAgICAgIGNhc2UgXCJPYmplY3RCaW5kaW5nXCI6XG4gICAgICAgIHJldHVybiB0ZXJtXzE2OTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yIFwiICsgdGVybV8xNjkudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTc0KSB7XG4gICAgc3dpdGNoICh0ZXJtXzE3NC50eXBlKSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNzQuYmluZGluZyksIGluaXQ6IHRlcm1fMTc0LmV4cHJlc3Npb259KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE3NCk7XG4gIH1cbiAgZW5mb3Jlc3RDYWxsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgcGFyZW5fMTc1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogdGhpcy50ZXJtLCBhcmd1bWVudHM6IHBhcmVuXzE3NS5pbm5lcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNzY7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgZW5mXzE3NiA9IG5ldyBFbmZvcmVzdGVyXzQ0KExpc3Qub2YodGhpcy5hZHZhbmNlKCkpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgZW5mXzE3NiA9IG5ldyBFbmZvcmVzdGVyXzQ0KHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtc18xNzcgPSBlbmZfMTc2LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiPT5cIik7XG4gICAgbGV0IGJvZHlfMTc4O1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keV8xNzggPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmZfMTc2ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBib2R5XzE3OCA9IGVuZl8xNzYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mXzE3Ni5yZXN0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJvd0V4cHJlc3Npb25cIiwge3BhcmFtczogcGFyYW1zXzE3NywgYm9keTogYm9keV8xNzh9KTtcbiAgfVxuICBlbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpIHtcbiAgICBsZXQga3dkXzE3OSA9IHRoaXMubWF0Y2hLZXl3b3JkKFwieWllbGRcIik7XG4gICAgbGV0IGxvb2thaGVhZF8xODAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE4MCAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dkXzE3OSwgbG9va2FoZWFkXzE4MCkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaXNHZW5lcmF0b3IgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIqXCIpKSB7XG4gICAgICAgIGlzR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBsZXQgdHlwZSA9IGlzR2VuZXJhdG9yID8gXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiA6IFwiWWllbGRFeHByZXNzaW9uXCI7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge2V4cHJlc3Npb246IGV4cHJ9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhUZW1wbGF0ZVwiLCB7dGVtcGxhdGU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhRdW90ZSgpIHtcbiAgICBsZXQgbmFtZV8xODEgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhRdW90ZVwiLCB7bmFtZTogbmFtZV8xODEsIHRlbXBsYXRlOiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE4MX0pLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmplY3RfMTgyID0gdGhpcy50ZXJtO1xuICAgIGxldCBkb3RfMTgzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnR5XzE4NCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogb2JqZWN0XzE4MiwgcHJvcGVydHk6IHByb3BlcnR5XzE4NH0pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCkge1xuICAgIGxldCBhcnJfMTg1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzE4NiA9IFtdO1xuICAgIGxldCBlbmZfMTg3ID0gbmV3IEVuZm9yZXN0ZXJfNDQoYXJyXzE4NS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xODcucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xODcucGVlaygpO1xuICAgICAgaWYgKGVuZl8xODcuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xODcuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50c18xODYucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5mXzE4Ny5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICBlbmZfMTg3LmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBlbmZfMTg3LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xODcuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE4Ni5wdXNoKG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0ZXJtID0gZW5mXzE4Ny5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmICh0ZXJtID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTg3LmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE4Ni5wdXNoKHRlcm0pO1xuICAgICAgICBlbmZfMTg3LmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzE4Nil9KTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9ial8xODggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydGllc18xODkgPSBMaXN0KCk7XG4gICAgbGV0IGVuZl8xOTAgPSBuZXcgRW5mb3Jlc3Rlcl80NChvYmpfMTg4LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbGFzdFByb3BfMTkxID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzE5MC5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZl8xOTAuZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKTtcbiAgICAgIGVuZl8xOTAuY29uc3VtZUNvbW1hKCk7XG4gICAgICBwcm9wZXJ0aWVzXzE4OSA9IHByb3BlcnRpZXNfMTg5LmNvbmNhdChwcm9wKTtcbiAgICAgIGlmIChsYXN0UHJvcF8xOTEgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mXzE5MC5jcmVhdGVFcnJvcihwcm9wLCBcImludmFsaWQgc3ludGF4IGluIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICAgIGxhc3RQcm9wXzE5MSA9IHByb3A7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXNfMTg5fSk7XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG4gICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSB0aGlzLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBcIm1ldGhvZFwiOlxuICAgICAgICByZXR1cm4gbWV0aG9kT3JLZXk7XG4gICAgICBjYXNlIFwiaWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2luaXQ6IGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSl9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlNob3J0aGFuZFByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleS52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgZXhwcl8xOTIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LCBleHByZXNzaW9uOiBleHByXzE5Mn0pO1xuICB9XG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE5MyA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xOTQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE5MywgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xOTQgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTkzLCBcImdldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiR2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE5MywgXCJzZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJTZXR0ZXJcIiwge25hbWU6IG5hbWUsIHBhcmFtOiBwYXJhbSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJNZXRob2RcIiwge2lzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xOTQsIG5hbWU6IG5hbWUsIHBhcmFtczogZm9ybWFsUGFyYW1zLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuYW1lLCBraW5kOiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTkzKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTkzKSA/IFwiaWRlbnRpZmllclwiIDogXCJwcm9wZXJ0eVwifTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5TmFtZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE5NSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTk1KSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE5NSkpIHtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTk1KSkge1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBleHByID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogZXhwcn0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IG5hbWVfMTk2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5hbWVfMTk2fSksIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTk2fSl9O1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwciwgaW5EZWZhdWx0LCBhbGxvd0dlbmVyYXRvcn0pIHtcbiAgICBsZXQgbmFtZV8xOTcgPSBudWxsLCBwYXJhbXNfMTk4LCBib2R5XzE5OSwgcmVzdF8yMDA7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzIwMSA9IGZhbHNlO1xuICAgIGxldCBmbktleXdvcmRfMjAyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMDMgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZV8yMDQgPSBpc0V4cHIgPyBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIDogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMDMsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMjAxID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzIwMyA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzIwMykpIHtcbiAgICAgIG5hbWVfMTk3ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWVfMTk3ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiKmRlZmF1bHQqXCIsIGZuS2V5d29yZF8yMDIpfSk7XG4gICAgfVxuICAgIHBhcmFtc18xOTggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xOTkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMjA1ID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zXzE5OCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMjA2ID0gZW5mXzIwNS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8yMDQsIHtuYW1lOiBuYW1lXzE5NywgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIwMSwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjA2LCBib2R5OiBib2R5XzE5OX0pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCkge1xuICAgIGxldCBuYW1lXzIwNyA9IG51bGwsIHBhcmFtc18yMDgsIGJvZHlfMjA5LCByZXN0XzIxMDtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMjExID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMTIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIxMiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8yMTEgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMjEyID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjEyKSkge1xuICAgICAgbmFtZV8yMDcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcGFyYW1zXzIwOCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzIwOSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8yMTMgPSBuZXcgRW5mb3Jlc3Rlcl80NChwYXJhbXNfMjA4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18yMTQgPSBlbmZfMjEzLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8yMDcsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8yMTEsIHBhcmFtczogZm9ybWFsUGFyYW1zXzIxNCwgYm9keTogYm9keV8yMDl9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IG5hbWVfMjE1LCBwYXJhbXNfMjE2LCBib2R5XzIxNywgcmVzdF8yMTg7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzIxOSA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMjIwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMjAsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMjE5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBuYW1lXzIxNSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIHBhcmFtc18yMTYgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8yMTcgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMjIxID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zXzIxNiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMjIyID0gZW5mXzIyMS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsIHtuYW1lOiBuYW1lXzIxNSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIxOSwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjIyLCBib2R5OiBib2R5XzIxN30pO1xuICB9XG4gIGVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpIHtcbiAgICBsZXQgaXRlbXNfMjIzID0gW107XG4gICAgbGV0IHJlc3RfMjI0ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLi4uXCIpO1xuICAgICAgICByZXN0XzIyNCA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGl0ZW1zXzIyMy5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBMaXN0KGl0ZW1zXzIyMyksIHJlc3Q6IHJlc3RfMjI0fSk7XG4gIH1cbiAgZW5mb3Jlc3RQYXJhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8yMjUgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiBmYWxzZSwgb3BlcmF0b3I6IG9wZXJhdG9yXzIyNS52YWwoKSwgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSl9KTtcbiAgfVxuICBlbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMjI2ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgIHRoaXMub3BDdHgucHJlYyA9IDE0O1xuICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMjcgPT4ge1xuICAgICAgbGV0IHR5cGVfMjI4LCB0ZXJtXzIyOSwgaXNQcmVmaXhfMjMwO1xuICAgICAgaWYgKG9wZXJhdG9yXzIyNi52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzIyNi52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMjI4ID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMjI5ID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybV8yMjcpO1xuICAgICAgICBpc1ByZWZpeF8yMzAgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZV8yMjggPSBcIlVuYXJ5RXhwcmVzc2lvblwiO1xuICAgICAgICBpc1ByZWZpeF8yMzAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRlcm1fMjI5ID0gcmlnaHRUZXJtXzIyNztcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIyOCwge29wZXJhdG9yOiBvcGVyYXRvcl8yMjYudmFsKCksIG9wZXJhbmQ6IHRlcm1fMjI5LCBpc1ByZWZpeDogaXNQcmVmaXhfMjMwfSk7XG4gICAgfTtcbiAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzQxO1xuICB9XG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIGxldCB0ZXN0XzIzMSA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgIGlmICh0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj9cIik7XG4gICAgbGV0IGVuZl8yMzIgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY29uc2VxdWVudF8yMzMgPSBlbmZfMjMyLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmZfMjMyLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgZW5mXzIzMiA9IG5ldyBFbmZvcmVzdGVyXzQ0KGVuZl8yMzIucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhbHRlcm5hdGVfMjM0ID0gZW5mXzIzMi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgdGhpcy5yZXN0ID0gZW5mXzIzMi5yZXN0O1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGVzdF8yMzEsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMjMzLCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8yMzR9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRUZXJtXzIzNSA9IHRoaXMudGVybTtcbiAgICBsZXQgb3BTdHhfMjM2ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG9wXzIzNyA9IG9wU3R4XzIzNi52YWwoKTtcbiAgICBsZXQgb3BQcmVjXzIzOCA9IGdldE9wZXJhdG9yUHJlYyhvcF8yMzcpO1xuICAgIGxldCBvcEFzc29jXzIzOSA9IGdldE9wZXJhdG9yQXNzb2Mob3BfMjM3KTtcbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlY18yMzgsIG9wQXNzb2NfMjM5KSkge1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IG9wUHJlY18yMzg7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjQwID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMjM1LCBvcGVyYXRvcjogb3BTdHhfMjM2LCByaWdodDogcmlnaHRUZXJtXzI0MH0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl80MTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm1fMjM1KTtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjQxID0gdGhpcy5tYXRjaFRlbXBsYXRlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzI0MiA9IGxvb2thaGVhZF8yNDEudG9rZW4uaXRlbXMubWFwKGl0XzI0MyA9PiB7XG4gICAgICBpZiAoaXRfMjQzIGluc3RhbmNlb2YgU3ludGF4ICYmIGl0XzI0My5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NChpdF8yNDMuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IGl0XzI0My5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzI0MjtcbiAgfVxuICBleHBhbmRNYWNybygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI0NCA9IHRoaXMucGVlaygpO1xuICAgIHdoaWxlICh0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzI0NCkpIHtcbiAgICAgIGxldCBuYW1lID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgc3ludGF4VHJhbnNmb3JtID0gdGhpcy5nZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudChuYW1lKTtcbiAgICAgIGlmIChzeW50YXhUcmFuc2Zvcm0gPT0gbnVsbCB8fCB0eXBlb2Ygc3ludGF4VHJhbnNmb3JtLnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lLCBcInRoZSBtYWNybyBuYW1lIHdhcyBub3QgYm91bmQgdG8gYSB2YWx1ZSB0aGF0IGNvdWxkIGJlIGludm9rZWRcIik7XG4gICAgICB9XG4gICAgICBsZXQgdXNlU2l0ZVNjb3BlID0gZnJlc2hTY29wZShcInVcIik7XG4gICAgICBsZXQgaW50cm9kdWNlZFNjb3BlID0gZnJlc2hTY29wZShcImlcIik7XG4gICAgICB0aGlzLmNvbnRleHQudXNlU2NvcGUgPSB1c2VTaXRlU2NvcGU7XG4gICAgICBsZXQgY3R4ID0gbmV3IE1hY3JvQ29udGV4dCh0aGlzLCBuYW1lLCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZSwgaW50cm9kdWNlZFNjb3BlKTtcbiAgICAgIGxldCByZXN1bHQgPSBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHN5bnRheFRyYW5zZm9ybS52YWx1ZS5jYWxsKG51bGwsIGN0eCkpO1xuICAgICAgaWYgKCFMaXN0LmlzTGlzdChyZXN1bHQpKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSwgXCJtYWNybyBtdXN0IHJldHVybiBhIGxpc3QgYnV0IGdvdDogXCIgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChzdHhfMjQ1ID0+IHtcbiAgICAgICAgaWYgKCEoc3R4XzI0NSAmJiB0eXBlb2Ygc3R4XzI0NS5hZGRTY29wZSA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSwgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eF8yNDUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHhfMjQ1LmFkZFNjb3BlKGludHJvZHVjZWRTY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlc3QgPSByZXN1bHQuY29uY2F0KGN0eC5fcmVzdCh0aGlzKSk7XG4gICAgICBsb29rYWhlYWRfMjQ0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICB9XG4gIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NiAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ2LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NyAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ3LCBcIixcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBpc1Rlcm0odGVybV8yNDgpIHtcbiAgICByZXR1cm4gdGVybV8yNDggJiYgdGVybV8yNDggaW5zdGFuY2VvZiBUZXJtO1xuICB9XG4gIGlzRU9GKHRlcm1fMjQ5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ5ICYmIHRlcm1fMjQ5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQ5LmlzRU9GKCk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHRlcm1fMjUwLCB2YWxfMjUxID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI1MCAmJiB0ZXJtXzI1MCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1MC5pc0lkZW50aWZpZXIoKSAmJiAodmFsXzI1MSA9PT0gbnVsbCB8fCB0ZXJtXzI1MC52YWwoKSA9PT0gdmFsXzI1MSk7XG4gIH1cbiAgaXNQcm9wZXJ0eU5hbWUodGVybV8yNTIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWZpZXIodGVybV8yNTIpIHx8IHRoaXMuaXNLZXl3b3JkKHRlcm1fMjUyKSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwodGVybV8yNTIpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKHRlcm1fMjUyKSB8fCB0aGlzLmlzQnJhY2tldHModGVybV8yNTIpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodGVybV8yNTMpIHtcbiAgICByZXR1cm4gdGVybV8yNTMgJiYgdGVybV8yNTMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNTMuaXNOdW1lcmljTGl0ZXJhbCgpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzI1NCkge1xuICAgIHJldHVybiB0ZXJtXzI1NCAmJiB0ZXJtXzI1NCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1NC5pc1N0cmluZ0xpdGVyYWwoKTtcbiAgfVxuICBpc1RlbXBsYXRlKHRlcm1fMjU1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU1ICYmIHRlcm1fMjU1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU1LmlzVGVtcGxhdGUoKTtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKHRlcm1fMjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU2ICYmIHRlcm1fMjU2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU2LmlzQm9vbGVhbkxpdGVyYWwoKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHRlcm1fMjU3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU3ICYmIHRlcm1fMjU3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU3LmlzTnVsbExpdGVyYWwoKTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHRlcm1fMjU4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU4ICYmIHRlcm1fMjU4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU4LmlzUmVndWxhckV4cHJlc3Npb24oKTtcbiAgfVxuICBpc1BhcmVucyh0ZXJtXzI1OSkge1xuICAgIHJldHVybiB0ZXJtXzI1OSAmJiB0ZXJtXzI1OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1OS5pc1BhcmVucygpO1xuICB9XG4gIGlzQnJhY2VzKHRlcm1fMjYwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYwICYmIHRlcm1fMjYwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjYwLmlzQnJhY2VzKCk7XG4gIH1cbiAgaXNCcmFja2V0cyh0ZXJtXzI2MSkge1xuICAgIHJldHVybiB0ZXJtXzI2MSAmJiB0ZXJtXzI2MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI2MS5pc0JyYWNrZXRzKCk7XG4gIH1cbiAgaXNBc3NpZ24odGVybV8yNjIpIHtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGVybV8yNjIpKSB7XG4gICAgICBzd2l0Y2ggKHRlcm1fMjYyLnZhbCgpKSB7XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgICBjYXNlIFwiXj1cIjpcbiAgICAgICAgY2FzZSBcIiY9XCI6XG4gICAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgICBjYXNlIFwiPj4+PVwiOlxuICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgY2FzZSBcIi09XCI6XG4gICAgICAgIGNhc2UgXCIqPVwiOlxuICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaXNLZXl3b3JkKHRlcm1fMjYzLCB2YWxfMjY0ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI2MyAmJiB0ZXJtXzI2MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI2My5pc0tleXdvcmQoKSAmJiAodmFsXzI2NCA9PT0gbnVsbCB8fCB0ZXJtXzI2My52YWwoKSA9PT0gdmFsXzI2NCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHRlcm1fMjY1LCB2YWxfMjY2ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI2NSAmJiB0ZXJtXzI2NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI2NS5pc1B1bmN0dWF0b3IoKSAmJiAodmFsXzI2NiA9PT0gbnVsbCB8fCB0ZXJtXzI2NS52YWwoKSA9PT0gdmFsXzI2Nik7XG4gIH1cbiAgaXNPcGVyYXRvcih0ZXJtXzI2Nykge1xuICAgIHJldHVybiB0ZXJtXzI2NyAmJiB0ZXJtXzI2NyBpbnN0YW5jZW9mIFN5bnRheCAmJiBpc09wZXJhdG9yKHRlcm1fMjY3KTtcbiAgfVxuICBpc1VwZGF0ZU9wZXJhdG9yKHRlcm1fMjY4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY4ICYmIHRlcm1fMjY4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjY4LmlzUHVuY3R1YXRvcigpICYmICh0ZXJtXzI2OC52YWwoKSA9PT0gXCIrK1wiIHx8IHRlcm1fMjY4LnZhbCgpID09PSBcIi0tXCIpO1xuICB9XG4gIGlzRm5EZWNsVHJhbnNmb3JtKHRlcm1fMjY5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY5ICYmIHRlcm1fMjY5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY5LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IEZ1bmN0aW9uRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1ZhckRlY2xUcmFuc2Zvcm0odGVybV8yNzApIHtcbiAgICByZXR1cm4gdGVybV8yNzAgJiYgdGVybV8yNzAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzAucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzTGV0RGVjbFRyYW5zZm9ybSh0ZXJtXzI3MSkge1xuICAgIHJldHVybiB0ZXJtXzI3MSAmJiB0ZXJtXzI3MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3MS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBMZXREZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKHRlcm1fMjcyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjcyICYmIHRlcm1fMjcyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjcyLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheERlY2xUcmFuc2Zvcm0odGVybV8yNzMpIHtcbiAgICByZXR1cm4gdGVybV8yNzMgJiYgdGVybV8yNzMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzMucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0odGVybV8yNzQpIHtcbiAgICByZXR1cm4gdGVybV8yNzQgJiYgdGVybV8yNzQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzQucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHRlcm1fMjc1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjc1ICYmIHRlcm1fMjc1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjc1LmlzU3ludGF4VGVtcGxhdGUoKTtcbiAgfVxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKHRlcm1fMjc2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjc2ICYmIHRlcm1fMjc2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjc2LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IFN5bnRheFF1b3RlVHJhbnNmb3JtO1xuICB9XG4gIGlzUmV0dXJuU3RtdFRyYW5zZm9ybSh0ZXJtXzI3Nykge1xuICAgIHJldHVybiB0ZXJtXzI3NyAmJiB0ZXJtXzI3NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3Ny5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaGlsZVRyYW5zZm9ybSh0ZXJtXzI3OCkge1xuICAgIHJldHVybiB0ZXJtXzI3OCAmJiB0ZXJtXzI3OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3OC5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBXaGlsZVRyYW5zZm9ybTtcbiAgfVxuICBpc0ZvclRyYW5zZm9ybSh0ZXJtXzI3OSkge1xuICAgIHJldHVybiB0ZXJtXzI3OSAmJiB0ZXJtXzI3OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3OS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBGb3JUcmFuc2Zvcm07XG4gIH1cbiAgaXNTd2l0Y2hUcmFuc2Zvcm0odGVybV8yODApIHtcbiAgICByZXR1cm4gdGVybV8yODAgJiYgdGVybV8yODAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODAucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3dpdGNoVHJhbnNmb3JtO1xuICB9XG4gIGlzQnJlYWtUcmFuc2Zvcm0odGVybV8yODEpIHtcbiAgICByZXR1cm4gdGVybV8yODEgJiYgdGVybV8yODEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODEucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gQnJlYWtUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb250aW51ZVRyYW5zZm9ybSh0ZXJtXzI4Mikge1xuICAgIHJldHVybiB0ZXJtXzI4MiAmJiB0ZXJtXzI4MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4Mi5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBDb250aW51ZVRyYW5zZm9ybTtcbiAgfVxuICBpc0RvVHJhbnNmb3JtKHRlcm1fMjgzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjgzICYmIHRlcm1fMjgzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjgzLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IERvVHJhbnNmb3JtO1xuICB9XG4gIGlzRGVidWdnZXJUcmFuc2Zvcm0odGVybV8yODQpIHtcbiAgICByZXR1cm4gdGVybV8yODQgJiYgdGVybV8yODQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODQucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gRGVidWdnZXJUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaXRoVHJhbnNmb3JtKHRlcm1fMjg1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjg1ICYmIHRlcm1fMjg1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjg1LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IFdpdGhUcmFuc2Zvcm07XG4gIH1cbiAgaXNUcnlUcmFuc2Zvcm0odGVybV8yODYpIHtcbiAgICByZXR1cm4gdGVybV8yODYgJiYgdGVybV8yODYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODYucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVHJ5VHJhbnNmb3JtO1xuICB9XG4gIGlzVGhyb3dUcmFuc2Zvcm0odGVybV8yODcpIHtcbiAgICByZXR1cm4gdGVybV8yODcgJiYgdGVybV8yODcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODcucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVGhyb3dUcmFuc2Zvcm07XG4gIH1cbiAgaXNJZlRyYW5zZm9ybSh0ZXJtXzI4OCkge1xuICAgIHJldHVybiB0ZXJtXzI4OCAmJiB0ZXJtXzI4OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4OC5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBJZlRyYW5zZm9ybTtcbiAgfVxuICBpc05ld1RyYW5zZm9ybSh0ZXJtXzI4OSkge1xuICAgIHJldHVybiB0ZXJtXzI4OSAmJiB0ZXJtXzI4OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4OS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBOZXdUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI5MCkge1xuICAgIHJldHVybiB0ZXJtXzI5MCAmJiB0ZXJtXzI5MCBpbnN0YW5jZW9mIFN5bnRheCAmJiAodGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yOTAucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yOTAucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuICBpc1ZhckJpbmRpbmdUcmFuc2Zvcm0odGVybV8yOTEpIHtcbiAgICByZXR1cm4gdGVybV8yOTEgJiYgdGVybV8yOTEgaW5zdGFuY2VvZiBTeW50YXggJiYgKHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjkxLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgaW5zdGFuY2VvZiBWYXJCaW5kaW5nVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yOTEucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIFZhckJpbmRpbmdUcmFuc2Zvcm0pO1xuICB9XG4gIGdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KHRlcm1fMjkyKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5lbnYuaGFzKHRlcm1fMjkyLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI5Mi5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LnN0b3JlLmdldCh0ZXJtXzI5Mi5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICB9XG4gIGxpbmVOdW1iZXJFcShhXzI5MywgYl8yOTQpIHtcbiAgICBpZiAoIShhXzI5MyAmJiBiXzI5NCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGFfMjkzLmxpbmVOdW1iZXIoKSA9PT0gYl8yOTQubGluZU51bWJlcigpO1xuICB9XG4gIG1hdGNoSWRlbnRpZmllcih2YWxfMjk1KSB7XG4gICAgbGV0IGxvb2thaGVhZF8yOTYgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzI5NikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjk2O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yOTYsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgbWF0Y2hLZXl3b3JkKHZhbF8yOTcpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI5OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMjk4LCB2YWxfMjk3KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTg7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5OCwgXCJleHBlY3RpbmcgXCIgKyB2YWxfMjk3KTtcbiAgfVxuICBtYXRjaExpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yOTkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8yOTkpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yOTkpIHx8IHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMjk5KSB8fCB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzI5OSkgfHwgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yOTkpIHx8IHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMjk5KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5OSwgXCJleHBlY3RpbmcgYSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoU3RyaW5nTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMwMCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMzAwKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDA7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwMCwgXCJleHBlY3RpbmcgYSBzdHJpbmcgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFRlbXBsYXRlKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzAxID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMzAxKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDE7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwMSwgXCJleHBlY3RpbmcgYSB0ZW1wbGF0ZSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoUGFyZW5zKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzAyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzMwMikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzAyLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwMiwgXCJleHBlY3RpbmcgcGFyZW5zXCIpO1xuICB9XG4gIG1hdGNoQ3VybGllcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMwMyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8zMDMpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMwMy5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDMsIFwiZXhwZWN0aW5nIGN1cmx5IGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFNxdWFyZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMDQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8zMDQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMwNC5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDQsIFwiZXhwZWN0aW5nIHNxYXVyZSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hVbmFyeU9wZXJhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzA1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKGlzVW5hcnlPcGVyYXRvcihsb29rYWhlYWRfMzA1KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDU7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwNSwgXCJleHBlY3RpbmcgYSB1bmFyeSBvcGVyYXRvclwiKTtcbiAgfVxuICBtYXRjaFB1bmN0dWF0b3IodmFsXzMwNikge1xuICAgIGxldCBsb29rYWhlYWRfMzA3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8zMDcpKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbF8zMDYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKGxvb2thaGVhZF8zMDcudmFsKCkgPT09IHZhbF8zMDYpIHtcbiAgICAgICAgICByZXR1cm4gbG9va2FoZWFkXzMwNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDcsIFwiZXhwZWN0aW5nIGEgXCIgKyB2YWxfMzA2ICsgXCIgcHVuY3R1YXRvclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDc7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwNywgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGNyZWF0ZUVycm9yKHN0eF8zMDgsIG1lc3NhZ2VfMzA5KSB7XG4gICAgbGV0IGN0eF8zMTAgPSBcIlwiO1xuICAgIGxldCBvZmZlbmRpbmdfMzExID0gc3R4XzMwODtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBjdHhfMzEwID0gdGhpcy5yZXN0LnNsaWNlKDAsIDIwKS5tYXAodGVybV8zMTIgPT4ge1xuICAgICAgICBpZiAodGVybV8zMTIuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiB0ZXJtXzMxMi5pbm5lcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMaXN0Lm9mKHRlcm1fMzEyKTtcbiAgICAgIH0pLmZsYXR0ZW4oKS5tYXAoc18zMTMgPT4ge1xuICAgICAgICBpZiAoc18zMTMgPT09IG9mZmVuZGluZ18zMTEpIHtcbiAgICAgICAgICByZXR1cm4gXCJfX1wiICsgc18zMTMudmFsKCkgKyBcIl9fXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNfMzEzLnZhbCgpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eF8zMTAgPSBvZmZlbmRpbmdfMzExLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZV8zMDkgKyBcIlxcblwiICsgY3R4XzMxMCk7XG4gIH1cbn1cbmV4cG9ydCB7RW5mb3Jlc3Rlcl80NCBhcyBFbmZvcmVzdGVyfSJdfQ==