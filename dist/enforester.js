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
      this.rest = this.expandMacro().concat(this.rest);
      lookahead_68 = this.peek();
      this.term = null;
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
    if (this.term === null && this.isTerm(lookahead_157)) {
      return this.advance();
    }
    if (this.term === null && this.isCompiletimeTransform(lookahead_157)) {
      let result = this.expandMacro();
      this.rest = result.concat(this.rest);
      return EXPR_LOOP_EXPANSION_43;
    }
    if (this.term === null && this.isKeyword(lookahead_157, "yield")) {
      return this.enforestYieldExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_157, "class")) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && this.isKeyword(lookahead_157, "super")) {
      this.advance();
      return new _terms2.default("Super", {});
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
    if (this.term === null && this.isNewTransform(lookahead_157)) {
      return this.enforestNewExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_157, "this")) {
      return new _terms2.default("ThisExpression", { stx: this.advance() });
    }
    if (this.term === null && (this.isIdentifier(lookahead_157) || this.isKeyword(lookahead_157, "let") || this.isKeyword(lookahead_157, "yield"))) {
      return new _terms2.default("IdentifierExpression", { name: this.advance() });
    }
    if (this.term === null && this.isNumericLiteral(lookahead_157)) {
      let num = this.advance();
      if (num.val() === 1 / 0) {
        return new _terms2.default("LiteralInfinityExpression", {});
      }
      return new _terms2.default("LiteralNumericExpression", { value: num });
    }
    if (this.term === null && this.isStringLiteral(lookahead_157)) {
      return new _terms2.default("LiteralStringExpression", { value: this.advance() });
    }
    if (this.term === null && this.isTemplate(lookahead_157)) {
      return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
    }
    if (this.term === null && this.isBooleanLiteral(lookahead_157)) {
      return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
    }
    if (this.term === null && this.isNullLiteral(lookahead_157)) {
      this.advance();
      return new _terms2.default("LiteralNullExpression", {});
    }
    if (this.term === null && this.isRegularExpression(lookahead_157)) {
      let reStx = this.advance();
      let lastSlash = reStx.token.value.lastIndexOf("/");
      let pattern = reStx.token.value.slice(1, lastSlash);
      let flags = reStx.token.value.slice(lastSlash + 1);
      return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
    }
    if (this.term === null && this.isParens(lookahead_157)) {
      return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
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
    if (this.term && this.isUpdateOperator(lookahead_157)) {
      return this.enforestUpdateExpression();
    }
    if (this.term && this.isOperator(lookahead_157)) {
      return this.enforestBinaryExpression();
    }
    if (this.term && this.isPunctuator(lookahead_157, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
      return this.enforestStaticMemberExpression();
    }
    if (this.term && this.isBrackets(lookahead_157)) {
      return this.enforestComputedMemberExpression();
    }
    if (this.term && this.isParens(lookahead_157)) {
      let paren = this.advance();
      return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
    }
    if (this.term && this.isTemplate(lookahead_157)) {
      return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
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
  enforestArgumentList() {
    let result_158 = [];
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
      result_158.push(arg);
    }
    return (0, _immutable.List)(result_158);
  }
  enforestNewExpression() {
    this.matchKeyword("new");
    let callee_159;
    if (this.isKeyword(this.peek(), "new")) {
      callee_159 = this.enforestNewExpression();
    } else if (this.isKeyword(this.peek(), "super")) {
      callee_159 = this.enforestExpressionLoop();
    } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
      this.advance();
      this.advance();
      return new _terms2.default("NewTargetExpression", {});
    } else {
      callee_159 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
    }
    let args_160;
    if (this.isParens(this.peek())) {
      args_160 = this.matchParens();
    } else {
      args_160 = (0, _immutable.List)();
    }
    return new _terms2.default("NewExpression", { callee: callee_159, arguments: args_160 });
  }
  enforestComputedMemberExpression() {
    let enf_161 = new Enforester_44(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_161.enforestExpression() });
  }
  transformDestructuring(term_162) {
    switch (term_162.type) {
      case "IdentifierExpression":
        return new _terms2.default("BindingIdentifier", { name: term_162.name });
      case "ParenthesizedExpression":
        if (term_162.inner.size === 1 && this.isIdentifier(term_162.inner.get(0))) {
          return new _terms2.default("BindingIdentifier", { name: term_162.inner.get(0) });
        }
      case "DataProperty":
        return new _terms2.default("BindingPropertyProperty", { name: term_162.name, binding: this.transformDestructuringWithDefault(term_162.expression) });
      case "ShorthandProperty":
        return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_162.name }), init: null });
      case "ObjectExpression":
        return new _terms2.default("ObjectBinding", { properties: term_162.properties.map(t_163 => this.transformDestructuring(t_163)) });
      case "ArrayExpression":
        let last = term_162.elements.last();
        if (last != null && last.type === "SpreadElement") {
          return new _terms2.default("ArrayBinding", { elements: term_162.elements.slice(0, -1).map(t_164 => t_164 && this.transformDestructuringWithDefault(t_164)), restElement: this.transformDestructuringWithDefault(last.expression) });
        } else {
          return new _terms2.default("ArrayBinding", { elements: term_162.elements.map(t_165 => t_165 && this.transformDestructuringWithDefault(t_165)), restElement: null });
        }
        return new _terms2.default("ArrayBinding", { elements: term_162.elements.map(t_166 => t_166 && this.transformDestructuring(t_166)), restElement: null });
      case "StaticPropertyName":
        return new _terms2.default("BindingIdentifier", { name: term_162.value });
      case "ComputedMemberExpression":
      case "StaticMemberExpression":
      case "ArrayBinding":
      case "BindingIdentifier":
      case "BindingPropertyIdentifier":
      case "BindingPropertyProperty":
      case "BindingWithDefault":
      case "ObjectBinding":
        return term_162;
    }
    (0, _errors.assert)(false, "not implemented yet for " + term_162.type);
  }
  transformDestructuringWithDefault(term_167) {
    switch (term_167.type) {
      case "AssignmentExpression":
        return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_167.binding), init: term_167.expression });
    }
    return this.transformDestructuring(term_167);
  }
  enforestArrowExpression() {
    let enf_168;
    if (this.isIdentifier(this.peek())) {
      enf_168 = new Enforester_44(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf_168 = new Enforester_44(p, (0, _immutable.List)(), this.context);
    }
    let params_169 = enf_168.enforestFormalParameters();
    this.matchPunctuator("=>");
    let body_170;
    if (this.isBraces(this.peek())) {
      body_170 = this.matchCurlies();
    } else {
      enf_168 = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
      body_170 = enf_168.enforestExpressionLoop();
      this.rest = enf_168.rest;
    }
    return new _terms2.default("ArrowExpression", { params: params_169, body: body_170 });
  }
  enforestYieldExpression() {
    let kwd_171 = this.matchKeyword("yield");
    let lookahead_172 = this.peek();
    if (this.rest.size === 0 || lookahead_172 && !this.lineNumberEq(kwd_171, lookahead_172)) {
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
    let name_173 = this.advance();
    return new _terms2.default("SyntaxQuote", { name: name_173, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_173 }), elements: this.enforestTemplateElements() }) });
  }
  enforestStaticMemberExpression() {
    let object_174 = this.term;
    let dot_175 = this.advance();
    let property_176 = this.advance();
    return new _terms2.default("StaticMemberExpression", { object: object_174, property: property_176 });
  }
  enforestArrayExpression() {
    let arr_177 = this.advance();
    let elements_178 = [];
    let enf_179 = new Enforester_44(arr_177.inner(), (0, _immutable.List)(), this.context);
    while (enf_179.rest.size > 0) {
      let lookahead = enf_179.peek();
      if (enf_179.isPunctuator(lookahead, ",")) {
        enf_179.advance();
        elements_178.push(null);
      } else if (enf_179.isPunctuator(lookahead, "...")) {
        enf_179.advance();
        let expression = enf_179.enforestExpressionLoop();
        if (expression == null) {
          throw enf_179.createError(lookahead, "expecting expression");
        }
        elements_178.push(new _terms2.default("SpreadElement", { expression: expression }));
      } else {
        let term = enf_179.enforestExpressionLoop();
        if (term == null) {
          throw enf_179.createError(lookahead, "expected expression");
        }
        elements_178.push(term);
        enf_179.consumeComma();
      }
    }
    return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_178) });
  }
  enforestObjectExpression() {
    let obj_180 = this.advance();
    let properties_181 = (0, _immutable.List)();
    let enf_182 = new Enforester_44(obj_180.inner(), (0, _immutable.List)(), this.context);
    let lastProp_183 = null;
    while (enf_182.rest.size > 0) {
      let prop = enf_182.enforestPropertyDefinition();
      enf_182.consumeComma();
      properties_181 = properties_181.concat(prop);
      if (lastProp_183 === prop) {
        throw enf_182.createError(prop, "invalid syntax in object");
      }
      lastProp_183 = prop;
    }
    return new _terms2.default("ObjectExpression", { properties: properties_181 });
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
    let expr_184 = this.enforestExpressionLoop();
    return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_184 });
  }
  enforestMethodDefinition() {
    let lookahead_185 = this.peek();
    let isGenerator_186 = false;
    if (this.isPunctuator(lookahead_185, "*")) {
      isGenerator_186 = true;
      this.advance();
    }
    if (this.isIdentifier(lookahead_185, "get") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Getter", { name: name, body: body }), kind: "method" };
    } else if (this.isIdentifier(lookahead_185, "set") && this.isPropertyName(this.peek(1))) {
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
      return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_186, name: name, params: formalParams, body: body }), kind: "method" };
    }
    return { methodOrKey: name, kind: this.isIdentifier(lookahead_185) || this.isKeyword(lookahead_185) ? "identifier" : "property" };
  }
  enforestPropertyName() {
    let lookahead_187 = this.peek();
    if (this.isStringLiteral(lookahead_187) || this.isNumericLiteral(lookahead_187)) {
      return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
    } else if (this.isBrackets(lookahead_187)) {
      let enf = new Enforester_44(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
    }
    let name_188 = this.advance();
    return { name: new _terms2.default("StaticPropertyName", { value: name_188 }), binding: new _terms2.default("BindingIdentifier", { name: name_188 }) };
  }
  enforestFunction(_ref5) {
    let isExpr = _ref5.isExpr;
    let inDefault = _ref5.inDefault;
    let allowGenerator = _ref5.allowGenerator;

    let name_189 = null,
        params_190,
        body_191,
        rest_192;
    let isGenerator_193 = false;
    let fnKeyword_194 = this.advance();
    let lookahead_195 = this.peek();
    let type_196 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
    if (this.isPunctuator(lookahead_195, "*")) {
      isGenerator_193 = true;
      this.advance();
      lookahead_195 = this.peek();
    }
    if (!this.isParens(lookahead_195)) {
      name_189 = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name_189 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_194) });
    }
    params_190 = this.matchParens();
    body_191 = this.matchCurlies();
    let enf_197 = new Enforester_44(params_190, (0, _immutable.List)(), this.context);
    let formalParams_198 = enf_197.enforestFormalParameters();
    return new _terms2.default(type_196, { name: name_189, isGenerator: isGenerator_193, params: formalParams_198, body: body_191 });
  }
  enforestFunctionExpression() {
    let name_199 = null,
        params_200,
        body_201,
        rest_202;
    let isGenerator_203 = false;
    this.advance();
    let lookahead_204 = this.peek();
    if (this.isPunctuator(lookahead_204, "*")) {
      isGenerator_203 = true;
      this.advance();
      lookahead_204 = this.peek();
    }
    if (!this.isParens(lookahead_204)) {
      name_199 = this.enforestBindingIdentifier();
    }
    params_200 = this.matchParens();
    body_201 = this.matchCurlies();
    let enf_205 = new Enforester_44(params_200, (0, _immutable.List)(), this.context);
    let formalParams_206 = enf_205.enforestFormalParameters();
    return new _terms2.default("FunctionExpression", { name: name_199, isGenerator: isGenerator_203, params: formalParams_206, body: body_201 });
  }
  enforestFunctionDeclaration() {
    let name_207, params_208, body_209, rest_210;
    let isGenerator_211 = false;
    this.advance();
    let lookahead_212 = this.peek();
    if (this.isPunctuator(lookahead_212, "*")) {
      isGenerator_211 = true;
      this.advance();
    }
    name_207 = this.enforestBindingIdentifier();
    params_208 = this.matchParens();
    body_209 = this.matchCurlies();
    let enf_213 = new Enforester_44(params_208, (0, _immutable.List)(), this.context);
    let formalParams_214 = enf_213.enforestFormalParameters();
    return new _terms2.default("FunctionDeclaration", { name: name_207, isGenerator: isGenerator_211, params: formalParams_214, body: body_209 });
  }
  enforestFormalParameters() {
    let items_215 = [];
    let rest_216 = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, "...")) {
        this.matchPunctuator("...");
        rest_216 = this.enforestBindingIdentifier();
        break;
      }
      items_215.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_215), rest: rest_216 });
  }
  enforestParam() {
    return this.enforestBindingElement();
  }
  enforestUpdateExpression() {
    let operator_217 = this.matchUnaryOperator();
    return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_217.val(), operand: this.transformDestructuring(this.term) });
  }
  enforestUnaryExpression() {
    let operator_218 = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm_219 => {
      let type_220, term_221, isPrefix_222;
      if (operator_218.val() === "++" || operator_218.val() === "--") {
        type_220 = "UpdateExpression";
        term_221 = this.transformDestructuring(rightTerm_219);
        isPrefix_222 = true;
      } else {
        type_220 = "UnaryExpression";
        isPrefix_222 = undefined;
        term_221 = rightTerm_219;
      }
      return new _terms2.default(type_220, { operator: operator_218.val(), operand: term_221, isPrefix: isPrefix_222 });
    };
    return EXPR_LOOP_OPERATOR_41;
  }
  enforestConditionalExpression() {
    let test_223 = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }
    this.matchPunctuator("?");
    let enf_224 = new Enforester_44(this.rest, (0, _immutable.List)(), this.context);
    let consequent_225 = enf_224.enforestExpressionLoop();
    enf_224.matchPunctuator(":");
    enf_224 = new Enforester_44(enf_224.rest, (0, _immutable.List)(), this.context);
    let alternate_226 = enf_224.enforestExpressionLoop();
    this.rest = enf_224.rest;
    return new _terms2.default("ConditionalExpression", { test: test_223, consequent: consequent_225, alternate: alternate_226 });
  }
  enforestBinaryExpression() {
    let leftTerm_227 = this.term;
    let opStx_228 = this.peek();
    let op_229 = opStx_228.val();
    let opPrec_230 = (0, _operators.getOperatorPrec)(op_229);
    let opAssoc_231 = (0, _operators.getOperatorAssoc)(op_229);
    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_230, opAssoc_231)) {
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = opPrec_230;
      this.opCtx.combine = rightTerm_232 => {
        return new _terms2.default("BinaryExpression", { left: leftTerm_227, operator: opStx_228, right: rightTerm_232 });
      };
      this.advance();
      return EXPR_LOOP_OPERATOR_41;
    } else {
      let term = this.opCtx.combine(leftTerm_227);

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
    let lookahead_233 = this.matchTemplate();
    let elements_234 = lookahead_233.token.items.map(it_235 => {
      if (it_235 instanceof _syntax2.default && it_235.isDelimiter()) {
        let enf = new Enforester_44(it_235.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default("TemplateElement", { rawValue: it_235.slice.text });
    });
    return elements_234;
  }
  expandMacro(enforestType_236) {
    let name_237 = this.advance();
    let syntaxTransform_238 = this.getFromCompiletimeEnvironment(name_237);
    if (syntaxTransform_238 == null || typeof syntaxTransform_238.value !== "function") {
      throw this.createError(name_237, "the macro name was not bound to a value that could be invoked");
    }
    let useSiteScope_239 = (0, _scope.freshScope)("u");
    let introducedScope_240 = (0, _scope.freshScope)("i");
    this.context.useScope = useSiteScope_239;
    let ctx_241 = new _macroContext2.default(this, name_237, this.context, useSiteScope_239, introducedScope_240);
    let result_242 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_238.value.call(null, ctx_241));
    if (!_immutable.List.isList(result_242)) {
      throw this.createError(name_237, "macro must return a list but got: " + result_242);
    }
    result_242 = result_242.map(stx_243 => {
      if (!(stx_243 && typeof stx_243.addScope === "function")) {
        throw this.createError(name_237, "macro must return syntax objects or terms but got: " + stx_243);
      }
      return stx_243.addScope(introducedScope_240, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
    });
    return result_242;
  }
  consumeSemicolon() {
    let lookahead_244 = this.peek();
    if (lookahead_244 && this.isPunctuator(lookahead_244, ";")) {
      this.advance();
    }
  }
  consumeComma() {
    let lookahead_245 = this.peek();
    if (lookahead_245 && this.isPunctuator(lookahead_245, ",")) {
      this.advance();
    }
  }
  isTerm(term_246) {
    return term_246 && term_246 instanceof _terms2.default;
  }
  isEOF(term_247) {
    return term_247 && term_247 instanceof _syntax2.default && term_247.isEOF();
  }
  isIdentifier(term_248) {
    let val_249 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_248 && term_248 instanceof _syntax2.default && term_248.isIdentifier() && (val_249 === null || term_248.val() === val_249);
  }
  isPropertyName(term_250) {
    return this.isIdentifier(term_250) || this.isKeyword(term_250) || this.isNumericLiteral(term_250) || this.isStringLiteral(term_250) || this.isBrackets(term_250);
  }
  isNumericLiteral(term_251) {
    return term_251 && term_251 instanceof _syntax2.default && term_251.isNumericLiteral();
  }
  isStringLiteral(term_252) {
    return term_252 && term_252 instanceof _syntax2.default && term_252.isStringLiteral();
  }
  isTemplate(term_253) {
    return term_253 && term_253 instanceof _syntax2.default && term_253.isTemplate();
  }
  isBooleanLiteral(term_254) {
    return term_254 && term_254 instanceof _syntax2.default && term_254.isBooleanLiteral();
  }
  isNullLiteral(term_255) {
    return term_255 && term_255 instanceof _syntax2.default && term_255.isNullLiteral();
  }
  isRegularExpression(term_256) {
    return term_256 && term_256 instanceof _syntax2.default && term_256.isRegularExpression();
  }
  isParens(term_257) {
    return term_257 && term_257 instanceof _syntax2.default && term_257.isParens();
  }
  isBraces(term_258) {
    return term_258 && term_258 instanceof _syntax2.default && term_258.isBraces();
  }
  isBrackets(term_259) {
    return term_259 && term_259 instanceof _syntax2.default && term_259.isBrackets();
  }
  isAssign(term_260) {
    if (this.isPunctuator(term_260)) {
      switch (term_260.val()) {
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
  isKeyword(term_261) {
    let val_262 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_261 && term_261 instanceof _syntax2.default && term_261.isKeyword() && (val_262 === null || term_261.val() === val_262);
  }
  isPunctuator(term_263) {
    let val_264 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_263 && term_263 instanceof _syntax2.default && term_263.isPunctuator() && (val_264 === null || term_263.val() === val_264);
  }
  isOperator(term_265) {
    return term_265 && term_265 instanceof _syntax2.default && (0, _operators.isOperator)(term_265);
  }
  isUpdateOperator(term_266) {
    return term_266 && term_266 instanceof _syntax2.default && term_266.isPunctuator() && (term_266.val() === "++" || term_266.val() === "--");
  }
  isFnDeclTransform(term_267) {
    return term_267 && term_267 instanceof _syntax2.default && this.context.env.get(term_267.resolve(this.context.phase)) === _transforms.FunctionDeclTransform;
  }
  isVarDeclTransform(term_268) {
    return term_268 && term_268 instanceof _syntax2.default && this.context.env.get(term_268.resolve(this.context.phase)) === _transforms.VariableDeclTransform;
  }
  isLetDeclTransform(term_269) {
    return term_269 && term_269 instanceof _syntax2.default && this.context.env.get(term_269.resolve(this.context.phase)) === _transforms.LetDeclTransform;
  }
  isConstDeclTransform(term_270) {
    return term_270 && term_270 instanceof _syntax2.default && this.context.env.get(term_270.resolve(this.context.phase)) === _transforms.ConstDeclTransform;
  }
  isSyntaxDeclTransform(term_271) {
    return term_271 && term_271 instanceof _syntax2.default && this.context.env.get(term_271.resolve(this.context.phase)) === _transforms.SyntaxDeclTransform;
  }
  isSyntaxrecDeclTransform(term_272) {
    return term_272 && term_272 instanceof _syntax2.default && this.context.env.get(term_272.resolve(this.context.phase)) === _transforms.SyntaxrecDeclTransform;
  }
  isSyntaxTemplate(term_273) {
    return term_273 && term_273 instanceof _syntax2.default && term_273.isSyntaxTemplate();
  }
  isSyntaxQuoteTransform(term_274) {
    return term_274 && term_274 instanceof _syntax2.default && this.context.env.get(term_274.resolve(this.context.phase)) === _transforms.SyntaxQuoteTransform;
  }
  isReturnStmtTransform(term_275) {
    return term_275 && term_275 instanceof _syntax2.default && this.context.env.get(term_275.resolve(this.context.phase)) === _transforms.ReturnStatementTransform;
  }
  isWhileTransform(term_276) {
    return term_276 && term_276 instanceof _syntax2.default && this.context.env.get(term_276.resolve(this.context.phase)) === _transforms.WhileTransform;
  }
  isForTransform(term_277) {
    return term_277 && term_277 instanceof _syntax2.default && this.context.env.get(term_277.resolve(this.context.phase)) === _transforms.ForTransform;
  }
  isSwitchTransform(term_278) {
    return term_278 && term_278 instanceof _syntax2.default && this.context.env.get(term_278.resolve(this.context.phase)) === _transforms.SwitchTransform;
  }
  isBreakTransform(term_279) {
    return term_279 && term_279 instanceof _syntax2.default && this.context.env.get(term_279.resolve(this.context.phase)) === _transforms.BreakTransform;
  }
  isContinueTransform(term_280) {
    return term_280 && term_280 instanceof _syntax2.default && this.context.env.get(term_280.resolve(this.context.phase)) === _transforms.ContinueTransform;
  }
  isDoTransform(term_281) {
    return term_281 && term_281 instanceof _syntax2.default && this.context.env.get(term_281.resolve(this.context.phase)) === _transforms.DoTransform;
  }
  isDebuggerTransform(term_282) {
    return term_282 && term_282 instanceof _syntax2.default && this.context.env.get(term_282.resolve(this.context.phase)) === _transforms.DebuggerTransform;
  }
  isWithTransform(term_283) {
    return term_283 && term_283 instanceof _syntax2.default && this.context.env.get(term_283.resolve(this.context.phase)) === _transforms.WithTransform;
  }
  isTryTransform(term_284) {
    return term_284 && term_284 instanceof _syntax2.default && this.context.env.get(term_284.resolve(this.context.phase)) === _transforms.TryTransform;
  }
  isThrowTransform(term_285) {
    return term_285 && term_285 instanceof _syntax2.default && this.context.env.get(term_285.resolve(this.context.phase)) === _transforms.ThrowTransform;
  }
  isIfTransform(term_286) {
    return term_286 && term_286 instanceof _syntax2.default && this.context.env.get(term_286.resolve(this.context.phase)) === _transforms.IfTransform;
  }
  isNewTransform(term_287) {
    return term_287 && term_287 instanceof _syntax2.default && this.context.env.get(term_287.resolve(this.context.phase)) === _transforms.NewTransform;
  }
  isCompiletimeTransform(term_288) {
    return term_288 && term_288 instanceof _syntax2.default && (this.context.env.get(term_288.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_288.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform);
  }
  isVarBindingTransform(term_289) {
    return term_289 && term_289 instanceof _syntax2.default && (this.context.env.get(term_289.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform || this.context.store.get(term_289.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform);
  }
  getFromCompiletimeEnvironment(term_290) {
    if (this.context.env.has(term_290.resolve(this.context.phase))) {
      return this.context.env.get(term_290.resolve(this.context.phase));
    }
    return this.context.store.get(term_290.resolve(this.context.phase));
  }
  lineNumberEq(a_291, b_292) {
    if (!(a_291 && b_292)) {
      return false;
    }
    return a_291.lineNumber() === b_292.lineNumber();
  }
  matchIdentifier(val_293) {
    let lookahead_294 = this.advance();
    if (this.isIdentifier(lookahead_294)) {
      return lookahead_294;
    }
    throw this.createError(lookahead_294, "expecting an identifier");
  }
  matchKeyword(val_295) {
    let lookahead_296 = this.advance();
    if (this.isKeyword(lookahead_296, val_295)) {
      return lookahead_296;
    }
    throw this.createError(lookahead_296, "expecting " + val_295);
  }
  matchLiteral() {
    let lookahead_297 = this.advance();
    if (this.isNumericLiteral(lookahead_297) || this.isStringLiteral(lookahead_297) || this.isBooleanLiteral(lookahead_297) || this.isNullLiteral(lookahead_297) || this.isTemplate(lookahead_297) || this.isRegularExpression(lookahead_297)) {
      return lookahead_297;
    }
    throw this.createError(lookahead_297, "expecting a literal");
  }
  matchStringLiteral() {
    let lookahead_298 = this.advance();
    if (this.isStringLiteral(lookahead_298)) {
      return lookahead_298;
    }
    throw this.createError(lookahead_298, "expecting a string literal");
  }
  matchTemplate() {
    let lookahead_299 = this.advance();
    if (this.isTemplate(lookahead_299)) {
      return lookahead_299;
    }
    throw this.createError(lookahead_299, "expecting a template literal");
  }
  matchParens() {
    let lookahead_300 = this.advance();
    if (this.isParens(lookahead_300)) {
      return lookahead_300.inner();
    }
    throw this.createError(lookahead_300, "expecting parens");
  }
  matchCurlies() {
    let lookahead_301 = this.advance();
    if (this.isBraces(lookahead_301)) {
      return lookahead_301.inner();
    }
    throw this.createError(lookahead_301, "expecting curly braces");
  }
  matchSquares() {
    let lookahead_302 = this.advance();
    if (this.isBrackets(lookahead_302)) {
      return lookahead_302.inner();
    }
    throw this.createError(lookahead_302, "expecting sqaure braces");
  }
  matchUnaryOperator() {
    let lookahead_303 = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead_303)) {
      return lookahead_303;
    }
    throw this.createError(lookahead_303, "expecting a unary operator");
  }
  matchPunctuator(val_304) {
    let lookahead_305 = this.advance();
    if (this.isPunctuator(lookahead_305)) {
      if (typeof val_304 !== "undefined") {
        if (lookahead_305.val() === val_304) {
          return lookahead_305;
        } else {
          throw this.createError(lookahead_305, "expecting a " + val_304 + " punctuator");
        }
      }
      return lookahead_305;
    }
    throw this.createError(lookahead_305, "expecting a punctuator");
  }
  createError(stx_306, message_307) {
    let ctx_308 = "";
    let offending_309 = stx_306;
    if (this.rest.size > 0) {
      ctx_308 = this.rest.slice(0, 20).map(term_310 => {
        if (term_310.isDelimiter()) {
          return term_310.inner();
        }
        return _immutable.List.of(term_310);
      }).flatten().map(s_311 => {
        if (s_311 === offending_309) {
          return "__" + s_311.val() + "__";
        }
        return s_311.val();
      }).join(" ");
    } else {
      ctx_308 = offending_309.toString();
    }
    return new Error(message_307 + "\n" + ctx_308);
  }
}
exports.Enforester = Enforester_44;
//# sourceMappingURL=data:application/json;base64,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TyxPQUFPLE1BQU0sR0FBTixFQUFQLEdBQXFCLElBQTVCO0FBQ0Q7QUFDRCxlQUFPLE1BQU0sR0FBTixFQUFQO0FBQ0QsT0FWUyxFQVVQLElBVk8sQ0FVRixHQVZFLENBQVY7QUFXRCxLQVpELE1BWU87QUFDTCxnQkFBVSxjQUFjLFFBQWQsRUFBVjtBQUNEO0FBQ0QsV0FBTyxJQUFJLEtBQUosQ0FBVSxjQUFjLElBQWQsR0FBcUIsT0FBL0IsQ0FBUDtBQUNEO0FBL2dEaUI7UUFpaERLLFUsR0FBakIsYSIsImZpbGUiOiJlbmZvcmVzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7RnVuY3Rpb25EZWNsVHJhbnNmb3JtLCBWYXJpYWJsZURlY2xUcmFuc2Zvcm0sIE5ld1RyYW5zZm9ybSwgTGV0RGVjbFRyYW5zZm9ybSwgQ29uc3REZWNsVHJhbnNmb3JtLCBTeW50YXhEZWNsVHJhbnNmb3JtLCBTeW50YXhyZWNEZWNsVHJhbnNmb3JtLCBTeW50YXhRdW90ZVRyYW5zZm9ybSwgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtLCBXaGlsZVRyYW5zZm9ybSwgSWZUcmFuc2Zvcm0sIEZvclRyYW5zZm9ybSwgU3dpdGNoVHJhbnNmb3JtLCBCcmVha1RyYW5zZm9ybSwgQ29udGludWVUcmFuc2Zvcm0sIERvVHJhbnNmb3JtLCBEZWJ1Z2dlclRyYW5zZm9ybSwgV2l0aFRyYW5zZm9ybSwgVHJ5VHJhbnNmb3JtLCBUaHJvd1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm0sIFZhckJpbmRpbmdUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge2lzT3BlcmF0b3IsIGlzVW5hcnlPcGVyYXRvciwgZ2V0T3BlcmF0b3JBc3NvYywgZ2V0T3BlcmF0b3JQcmVjLCBvcGVyYXRvckx0fSBmcm9tIFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7ZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCB7c2FuaXRpemVSZXBsYWNlbWVudFZhbHVlc30gZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzQxID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQyID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzID0ge307XG5jbGFzcyBFbmZvcmVzdGVyXzQ0IHtcbiAgY29uc3RydWN0b3Ioc3R4bF80NSwgcHJldl80NiwgY29udGV4dF80Nykge1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChzdHhsXzQ1KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChwcmV2XzQ2KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChjb250ZXh0XzQ3LCBcImV4cGVjdGluZyBhIGNvbnRleHQgdG8gZW5mb3Jlc3RcIik7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLnJlc3QgPSBzdHhsXzQ1O1xuICAgIHRoaXMucHJldiA9IHByZXZfNDY7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF80NztcbiAgfVxuICBwZWVrKG5fNDggPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdC5nZXQobl80OCk7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBsZXQgcmV0XzQ5ID0gdGhpcy5yZXN0LmZpcnN0KCk7XG4gICAgdGhpcy5yZXN0ID0gdGhpcy5yZXN0LnJlc3QoKTtcbiAgICByZXR1cm4gcmV0XzQ5O1xuICB9XG4gIGVuZm9yZXN0KHR5cGVfNTAgPSBcIk1vZHVsZVwiKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdF81MTtcbiAgICBpZiAodHlwZV81MCA9PT0gXCJleHByZXNzaW9uXCIpIHtcbiAgICAgIHJlc3VsdF81MSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRfNTEgPSB0aGlzLmVuZm9yZXN0TW9kdWxlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF81MTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdEJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RNb2R1bGVJdGVtKCk7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGVJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfNTIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzUyLCBcImltcG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTIsIFwiZXhwb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81MiwgXCIjXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdExhbmd1YWdlUHJhZ21hKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYW5ndWFnZVByYWdtYSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcIiNcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJsYW5nXCIpO1xuICAgIGxldCBwYXRoXzUzID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJQcmFnbWFcIiwge2tpbmQ6IFwibGFuZ1wiLCBpdGVtczogTGlzdC5vZihwYXRoXzUzKX0pO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF81NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTQsIFwiKlwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF81NCkpIHtcbiAgICAgIGxldCBuYW1lZEV4cG9ydHMgPSB0aGlzLmVuZm9yZXN0RXhwb3J0Q2xhdXNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJmcm9tXCIpKSB7XG4gICAgICAgIG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRGcm9tXCIsIHtuYW1lZEV4cG9ydHM6IG5hbWVkRXhwb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NCwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKHRoaXMucGVlaygpKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNsYXNzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiBib2R5fSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTQpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTQpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF81NCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydENsYXVzZSgpIHtcbiAgICBsZXQgZW5mXzU1ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfNTYgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzU1LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzU2LnB1c2goZW5mXzU1LmVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkpO1xuICAgICAgZW5mXzU1LmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNTYpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkge1xuICAgIGxldCBuYW1lXzU3ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGV4cG9ydGVkTmFtZSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNTcsIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgZXhwb3J0ZWROYW1lOiBuYW1lXzU3fSk7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzU4ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGRlZmF1bHRCaW5kaW5nXzU5ID0gbnVsbDtcbiAgICBsZXQgbmFtZWRJbXBvcnRzXzYwID0gTGlzdCgpO1xuICAgIGxldCBmb3JTeW50YXhfNjEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzU4KSkge1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ181OSwgbmFtZWRJbXBvcnRzOiBuYW1lZEltcG9ydHNfNjAsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNTgpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81OCkpIHtcbiAgICAgIGRlZmF1bHRCaW5kaW5nXzU5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGZvclN5bnRheF82MSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNTksIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyLCBuYW1lZEltcG9ydHM6IExpc3QoKSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjF9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICBsb29rYWhlYWRfNTggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNTgpKSB7XG4gICAgICBsZXQgaW1wb3J0cyA9IHRoaXMuZW5mb3Jlc3ROYW1lZEltcG9ydHMoKTtcbiAgICAgIGxldCBmcm9tQ2xhdXNlID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF82MSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ181OSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjEsIG5hbWVkSW1wb3J0czogaW1wb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBmcm9tQ2xhdXNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTgsIFwiKlwiKSkge1xuICAgICAgbGV0IG5hbWVzcGFjZUJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNjEgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNTksIGZvclN5bnRheDogZm9yU3ludGF4XzYxLCBuYW1lc3BhY2VCaW5kaW5nOiBuYW1lc3BhY2VCaW5kaW5nLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF81OCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIqXCIpO1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICB9XG4gIGVuZm9yZXN0TmFtZWRJbXBvcnRzKCkge1xuICAgIGxldCBlbmZfNjIgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF82MyA9IFtdO1xuICAgIHdoaWxlIChlbmZfNjIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfNjMucHVzaChlbmZfNjIuZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkpO1xuICAgICAgZW5mXzYyLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNjMpO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzY0ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG5hbWVfNjU7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82NCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY0KSkge1xuICAgICAgbmFtZV82NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNjV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNjQsIFwidW5leHBlY3RlZCB0b2tlbiBpbiBpbXBvcnQgc3BlY2lmaWVyXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNjUsIGJpbmRpbmc6IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGcm9tQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiZnJvbVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzY2ID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbG9va2FoZWFkXzY2O1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF82NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbih7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50KCkge1xuICAgIGxldCBsb29rYWhlYWRfNjggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICB0aGlzLnJlc3QgPSB0aGlzLmV4cGFuZE1hY3JvKCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICBsb29rYWhlYWRfNjggPSB0aGlzLnBlZWsoKTtcbiAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJsb2NrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWZUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZlN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGb3JUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3dpdGNoVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyZWFrVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29udGludWVUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEb1RyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERvU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RlYnVnZ2VyVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2l0aFRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVHJ5VHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VHJ5U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rocm93VHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNjgsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82OCkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIjpcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNjgpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNjgpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzY4KSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWRfNjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF82OCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkVtcHR5U3RhdGVtZW50XCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCkge1xuICAgIGxldCBsYWJlbF82OSA9IHRoaXMubWF0Y2hJZGVudGlmaWVyKCk7XG4gICAgbGV0IHB1bmNfNzAgPSB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IHN0bXRfNzEgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzY5LCBib2R5OiBzdG10XzcxfSk7XG4gIH1cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImJyZWFrXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNzIgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzMgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNzIsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNzIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzIsIFwibGV0XCIpKSB7XG4gICAgICBsYWJlbF83MyA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzN9KTtcbiAgfVxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRyeVwiKTtcbiAgICBsZXQgYm9keV83NCA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXRjaFwiKSkge1xuICAgICAgbGV0IGNhdGNoQ2xhdXNlID0gdGhpcy5lbmZvcmVzdENhdGNoQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzc0LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2UsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogYm9keV83NCwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNzQsIGNhdGNoQ2xhdXNlOiBudWxsLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInRyeSB3aXRoIG5vIGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gIH1cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhdGNoXCIpO1xuICAgIGxldCBiaW5kaW5nUGFyZW5zXzc1ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNzYgPSBuZXcgRW5mb3Jlc3Rlcl80NChiaW5kaW5nUGFyZW5zXzc1LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGJpbmRpbmdfNzcgPSBlbmZfNzYuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGJvZHlfNzggPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogYmluZGluZ183NywgYm9keTogYm9keV83OH0pO1xuICB9XG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0aHJvd1wiKTtcbiAgICBsZXQgZXhwcmVzc2lvbl83OSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb25fNzl9KTtcbiAgfVxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aXRoXCIpO1xuICAgIGxldCBvYmpQYXJlbnNfODAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MSA9IG5ldyBFbmZvcmVzdGVyXzQ0KG9ialBhcmVuc184MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBvYmplY3RfODIgPSBlbmZfODEuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfODMgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7b2JqZWN0OiBvYmplY3RfODIsIGJvZHk6IGJvZHlfODN9KTtcbiAgfVxuICBlbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVidWdnZXJcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGVidWdnZXJTdGF0ZW1lbnRcIiwge30pO1xuICB9XG4gIGVuZm9yZXN0RG9TdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkb1wiKTtcbiAgICBsZXQgYm9keV84NCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCB0ZXN0Qm9keV84NSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzg2ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGVzdEJvZHlfODUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdF84NyA9IGVuZl84Ni5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzg0LCB0ZXN0OiB0ZXN0Xzg3fSk7XG4gIH1cbiAgZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dkXzg4ID0gdGhpcy5tYXRjaEtleXdvcmQoXCJjb250aW51ZVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzg5ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzkwID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzg5LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF85MH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkXzg4LCBsb29rYWhlYWRfODkpICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODkpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84OSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfODksIFwibGV0XCIpKSkge1xuICAgICAgbGFiZWxfOTAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzkwfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJzd2l0Y2hcIik7XG4gICAgbGV0IGNvbmRfOTEgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyXzQ0KGNvbmRfOTEsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZGlzY3JpbWluYW50XzkzID0gZW5mXzkyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5Xzk0ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBpZiAoYm9keV85NC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50XzkzLCBjYXNlczogTGlzdCgpfSk7XG4gICAgfVxuICAgIGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyXzQ0KGJvZHlfOTQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY2FzZXNfOTUgPSBlbmZfOTIuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgIGxldCBsb29rYWhlYWRfOTYgPSBlbmZfOTIucGVlaygpO1xuICAgIGlmIChlbmZfOTIuaXNLZXl3b3JkKGxvb2thaGVhZF85NiwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmZfOTIuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZl85Mi5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfOTMsIHByZURlZmF1bHRDYXNlczogY2FzZXNfOTUsIGRlZmF1bHRDYXNlOiBkZWZhdWx0Q2FzZSwgcG9zdERlZmF1bHRDYXNlczogcG9zdERlZmF1bHRDYXNlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50XzkzLCBjYXNlczogY2FzZXNfOTV9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VzKCkge1xuICAgIGxldCBjYXNlc185NyA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikpKSB7XG4gICAgICBjYXNlc185Ny5wdXNoKHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChjYXNlc185Nyk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2FzZVwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpLCBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCkge1xuICAgIGxldCByZXN1bHRfOTggPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhc2VcIikpKSB7XG4gICAgICByZXN1bHRfOTgucHVzaCh0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF85OCk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVmYXVsdFwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9yU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZm9yXCIpO1xuICAgIGxldCBjb25kXzk5ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTAwID0gbmV3IEVuZm9yZXN0ZXJfNDQoY29uZF85OSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTAxLCB0ZXN0XzEwMiwgaW5pdF8xMDMsIHJpZ2h0XzEwNCwgdHlwZV8xMDUsIGxlZnRfMTA2LCB1cGRhdGVfMTA3O1xuICAgIGlmIChlbmZfMTAwLmlzUHVuY3R1YXRvcihlbmZfMTAwLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mXzEwMC5pc1B1bmN0dWF0b3IoZW5mXzEwMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICB0ZXN0XzEwMiA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICBlbmZfMTAwLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICBpZiAoZW5mXzEwMC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgcmlnaHRfMTA0ID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogbnVsbCwgdGVzdDogdGVzdF8xMDIsIHVwZGF0ZTogcmlnaHRfMTA0LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9va2FoZWFkXzEwMSA9IGVuZl8xMDAucGVlaygpO1xuICAgICAgaWYgKGVuZl8xMDAuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMDEpIHx8IGVuZl8xMDAuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMDEpIHx8IGVuZl8xMDAuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEwMSkpIHtcbiAgICAgICAgaW5pdF8xMDMgPSBlbmZfMTAwLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpO1xuICAgICAgICBsb29rYWhlYWRfMTAxID0gZW5mXzEwMC5wZWVrKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTAxLCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMDEsIFwib2ZcIikpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEwMSwgXCJpblwiKSkge1xuICAgICAgICAgICAgZW5mXzEwMC5hZHZhbmNlKCk7XG4gICAgICAgICAgICByaWdodF8xMDQgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV8xMDUgPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTAxLCBcIm9mXCIpKSB7XG4gICAgICAgICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0XzEwNCA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzEwNSA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1LCB7bGVmdDogaW5pdF8xMDMsIHJpZ2h0OiByaWdodF8xMDQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGVuZl8xMDAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl8xMDAuaXNQdW5jdHVhdG9yKGVuZl8xMDAucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfMTAwLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0XzEwMiA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF8xMDIgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl8xMDAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfMTA3ID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChlbmZfMTAwLnBlZWsoMSksIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mXzEwMC5wZWVrKDEpLCBcIm9mXCIpKSB7XG4gICAgICAgICAgbGVmdF8xMDYgPSBlbmZfMTAwLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgICBsZXQga2luZCA9IGVuZl8xMDAuYWR2YW5jZSgpO1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChraW5kLCBcImluXCIpKSB7XG4gICAgICAgICAgICB0eXBlXzEwNSA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHlwZV8xMDUgPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJpZ2h0XzEwNCA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1LCB7bGVmdDogbGVmdF8xMDYsIHJpZ2h0OiByaWdodF8xMDQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGluaXRfMTAzID0gZW5mXzEwMC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgZW5mXzEwMC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzEwMC5pc1B1bmN0dWF0b3IoZW5mXzEwMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl8xMDAuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfMTAyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0XzEwMiA9IGVuZl8xMDAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzEwMC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV8xMDcgPSBlbmZfMTAwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0XzEwMywgdGVzdDogdGVzdF8xMDIsIHVwZGF0ZTogdXBkYXRlXzEwNywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0SWZTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJpZlwiKTtcbiAgICBsZXQgY29uZF8xMDggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl8xMDkgPSBuZXcgRW5mb3Jlc3Rlcl80NChjb25kXzEwOCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTEwID0gZW5mXzEwOS5wZWVrKCk7XG4gICAgbGV0IHRlc3RfMTExID0gZW5mXzEwOS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF8xMTEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl8xMDkuY3JlYXRlRXJyb3IobG9va2FoZWFkXzExMCwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGNvbnNlcXVlbnRfMTEyID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIGxldCBhbHRlcm5hdGVfMTEzID0gbnVsbDtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZWxzZVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBhbHRlcm5hdGVfMTEzID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF8xMTEsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMTEyLCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8xMTN9KTtcbiAgfVxuICBlbmZvcmVzdFdoaWxlU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IGNvbmRfMTE0ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTE1ID0gbmV3IEVuZm9yZXN0ZXJfNDQoY29uZF8xMTQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzExNiA9IGVuZl8xMTUucGVlaygpO1xuICAgIGxldCB0ZXN0XzExNyA9IGVuZl8xMTUuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfMTE3ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfMTE1LmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMTYsIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBib2R5XzExOCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF8xMTcsIGJvZHk6IGJvZHlfMTE4fSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9ja1N0YXRlbWVudCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZW5mb3Jlc3RCbG9jaygpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9jaygpIHtcbiAgICBsZXQgYl8xMTkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBib2R5XzEyMCA9IFtdO1xuICAgIGxldCBlbmZfMTIxID0gbmV3IEVuZm9yZXN0ZXJfNDQoYl8xMTksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEyMS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTIxLnBlZWsoKTtcbiAgICAgIGxldCBzdG10ID0gZW5mXzEyMS5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgaWYgKHN0bXQgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBlbmZfMTIxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJub3QgYSBzdGF0ZW1lbnRcIik7XG4gICAgICB9XG4gICAgICBib2R5XzEyMC5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogTGlzdChib2R5XzEyMCl9KTtcbiAgfVxuICBlbmZvcmVzdENsYXNzKHtpc0V4cHIsIGluRGVmYXVsdH0pIHtcbiAgICBsZXQga3dfMTIyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IG5hbWVfMTIzID0gbnVsbCwgc3Vwcl8xMjQgPSBudWxsO1xuICAgIGxldCB0eXBlXzEyNSA9IGlzRXhwciA/IFwiQ2xhc3NFeHByZXNzaW9uXCIgOiBcIkNsYXNzRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEyMyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoIWlzRXhwcikge1xuICAgICAgaWYgKGluRGVmYXVsdCkge1xuICAgICAgICBuYW1lXzEyMyA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIl9kZWZhdWx0XCIsIGt3XzEyMil9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJleHRlbmRzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN1cHJfMTI0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuICAgIGxldCBlbGVtZW50c18xMjYgPSBbXTtcbiAgICBsZXQgZW5mXzEyNyA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEyNy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGlmIChlbmZfMTI3LmlzUHVuY3R1YXRvcihlbmZfMTI3LnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIGVuZl8xMjcuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaWRlbnRpZmllclwiICYmIG1ldGhvZE9yS2V5LnZhbHVlLnZhbCgpID09PSBcInN0YXRpY1wiKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIGlmIChraW5kID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICAgIGVsZW1lbnRzXzEyNi5wdXNoKG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogaXNTdGF0aWMsIG1ldGhvZDogbWV0aG9kT3JLZXl9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGVuZl8xMjcucGVlaygpLCBcIk9ubHkgbWV0aG9kcyBhcmUgYWxsb3dlZCBpbiBjbGFzc2VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMjUsIHtuYW1lOiBuYW1lXzEyMywgc3VwZXI6IHN1cHJfMTI0LCBlbGVtZW50czogTGlzdChlbGVtZW50c18xMjYpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KHthbGxvd1B1bmN0dWF0b3J9ID0ge30pIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyOCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTI4KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTI4KSB8fCBhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyOCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoe2FsbG93UHVuY3R1YXRvcjogYWxsb3dQdW5jdHVhdG9yfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEyOCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMjgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEJpbmRpbmcoKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCkge1xuICAgIGxldCBlbmZfMTI5ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzEzMCA9IFtdO1xuICAgIHdoaWxlIChlbmZfMTI5LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcHJvcGVydGllc18xMzAucHVzaChlbmZfMTI5LmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mXzEyOS5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogTGlzdChwcm9wZXJ0aWVzXzEzMCl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzMSA9IHRoaXMucGVlaygpO1xuICAgIGxldCB7bmFtZSwgYmluZGluZ30gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzEsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzEsIFwieWllbGRcIikpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBleHByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IGJpbmRpbmcsIGluaXQ6IGRlZmF1bHRWYWx1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgYmluZGluZyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiBuYW1lLCBiaW5kaW5nOiBiaW5kaW5nfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXRfMTMyID0gdGhpcy5tYXRjaFNxdWFyZXMoKTtcbiAgICBsZXQgZW5mXzEzMyA9IG5ldyBFbmZvcmVzdGVyXzQ0KGJyYWNrZXRfMTMyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzXzEzNCA9IFtdLCByZXN0RWxlbWVudF8xMzUgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTMzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZl8xMzMuaXNQdW5jdHVhdG9yKGVuZl8xMzMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzEzMy5jb25zdW1lQ29tbWEoKTtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVuZl8xMzMuaXNQdW5jdHVhdG9yKGVuZl8xMzMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICAgIGVuZl8xMzMuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3RFbGVtZW50XzEzNSA9IGVuZl8xMzMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmZfMTMzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTMzLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgICAgZWxlbWVudHNfMTM0LnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEzNCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMzV9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nXzEzNiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICBiaW5kaW5nXzEzNiA9IG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiBiaW5kaW5nXzEzNiwgaW5pdDogaW5pdH0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ18xMzY7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7YWxsb3dQdW5jdHVhdG9yfSA9IHt9KSB7XG4gICAgbGV0IG5hbWVfMTM3O1xuICAgIGlmIChhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEzNyA9IHRoaXMuZW5mb3Jlc3RQdW5jdHVhdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVfMTM3ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTM3fSk7XG4gIH1cbiAgZW5mb3Jlc3RQdW5jdHVhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTM4ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEzOCwgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzOSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM5KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMzksIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3XzE0MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTQxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNDEgJiYgIXRoaXMubGluZU51bWJlckVxKGt3XzE0MCwgbG9va2FoZWFkXzE0MSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH1cbiAgICBsZXQgdGVybV8xNDIgPSBudWxsO1xuICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE0MSwgXCI7XCIpKSB7XG4gICAgICB0ZXJtXzE0MiA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBleHBlY3QodGVybV8xNDIgIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkXzE0MSwgdGhpcy5yZXN0KTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0ZXJtXzE0Mn0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpIHtcbiAgICBsZXQga2luZF8xNDM7XG4gICAgbGV0IGxvb2thaGVhZF8xNDQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQga2luZFN5bl8xNDUgPSBsb29rYWhlYWRfMTQ0O1xuICAgIGxldCBwaGFzZV8xNDYgPSB0aGlzLmNvbnRleHQucGhhc2U7XG4gICAgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDMgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDUgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDUucmVzb2x2ZShwaGFzZV8xNDYpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDMgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDUgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDUucmVzb2x2ZShwaGFzZV8xNDYpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzE0MyA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQzID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ1ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ1LnJlc29sdmUocGhhc2VfMTQ2KSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQzID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG4gICAgbGV0IGRlY2xzXzE0NyA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheDoga2luZF8xNDMgPT09IFwic3ludGF4XCIgfHwga2luZF8xNDMgPT09IFwic3ludGF4cmVjXCJ9KTtcbiAgICAgIGxldCBsb29rYWhlYWRfMTQ0ID0gdGhpcy5wZWVrKCk7XG4gICAgICBkZWNsc18xNDcgPSBkZWNsc18xNDcuY29uY2F0KHRlcm0pO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDQsIFwiLFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBraW5kXzE0MywgZGVjbGFyYXRvcnM6IGRlY2xzXzE0N30pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheH0pIHtcbiAgICBsZXQgaWRfMTQ4ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcjogaXNTeW50YXh9KTtcbiAgICBsZXQgbG9va2FoZWFkXzE0OSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpbml0XzE1MCwgcmVzdF8xNTE7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDksIFwiPVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBpbml0XzE1MCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdF8xNTAgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IGlkXzE0OCwgaW5pdDogaW5pdF8xNTB9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0XzE1MiA9IHRoaXMucmVzdC5nZXQoMCk7XG4gICAgbGV0IGV4cHJfMTUzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwcl8xNTMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3Ioc3RhcnRfMTUyLCBcIm5vdCBhIHZhbGlkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMTUzfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0XzE1NCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGxldCBsb29rYWhlYWRfMTU1ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNTUsIFwiLFwiKSkge1xuICAgICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgbGVmdF8xNTQgPSBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTU0LCBvcGVyYXRvcjogb3BlcmF0b3IsIHJpZ2h0OiByaWdodH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHJldHVybiBsZWZ0XzE1NDtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtwcmVjOiAwLCBjb21iaW5lOiB4XzE1NiA9PiB4XzE1Niwgc3RhY2s6IExpc3QoKX07XG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQyICYmIHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfNDIpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9PUEVSQVRPUl80MSB8fCB0ZXJtID09PSBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzKSB7XG4gICAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRlcm0gPSB0ZXJtO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE1NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICB0aGlzLnJlc3QgPSByZXN1bHQuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX0VYUEFOU0lPTl80MztcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU3LCBcInlpZWxkXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwic3VwZXJcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU3VwZXJcIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTU3KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTcpKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiPT5cIikgJiYgdGhpcy5saW5lTnVtYmVyRXEobG9va2FoZWFkXzE1NywgdGhpcy5wZWVrKDEpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4VGVtcGxhdGUobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4UXVvdGVUcmFuc2Zvcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU3LCBcInRoaXNcIikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRoaXNFeHByZXNzaW9uXCIsIHtzdHg6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTcsIFwieWllbGRcIikpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIGxldCBudW0gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmIChudW0udmFsKCkgPT09IDEgLyAwKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIiwge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbnVtfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBudWxsLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIGxldCByZVN0eCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGxhc3RTbGFzaCA9IHJlU3R4LnRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgIGxldCBwYXR0ZXJuID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UoMSwgbGFzdFNsYXNoKTtcbiAgICAgIGxldCBmbGFncyA9IHJlU3R4LnRva2VuLnZhbHVlLnNsaWNlKGxhc3RTbGFzaCArIDEpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiwge3BhdHRlcm46IHBhdHRlcm4sIGZsYWdzOiBmbGFnc30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIsIHtpbm5lcjogdGhpcy5hZHZhbmNlKCkuaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVmFyQmluZGluZ1RyYW5zZm9ybShsb29rYWhlYWRfMTU3KSkge1xuICAgICAgbGV0IGlkID0gdGhpcy5nZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudChsb29rYWhlYWRfMTU3KS5pZDtcbiAgICAgIGlmIChpZCAhPT0gbG9va2FoZWFkXzE1Nykge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5yZXN0ID0gTGlzdC5vZihpZCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzQzO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNVcGRhdGVPcGVyYXRvcihsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTU3LCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICBsZXQgcGFyZW4gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHRoaXMudGVybSwgYXJndW1lbnRzOiBwYXJlbi5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzE1NykpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NywgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV80MjtcbiAgfVxuICBlbmZvcmVzdEFyZ3VtZW50TGlzdCgpIHtcbiAgICBsZXQgcmVzdWx0XzE1OCA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBhcmcgPSBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIsXCIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0XzE1OC5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xNTgpO1xuICB9XG4gIGVuZm9yZXN0TmV3RXhwcmVzc2lvbigpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIm5ld1wiKTtcbiAgICBsZXQgY2FsbGVlXzE1OTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwibmV3XCIpKSB7XG4gICAgICBjYWxsZWVfMTU5ID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcInN1cGVyXCIpKSB7XG4gICAgICBjYWxsZWVfMTU5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIuXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJ0YXJnZXRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdUYXJnZXRFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGVlXzE1OSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICB9XG4gICAgbGV0IGFyZ3NfMTYwO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xNjAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTYwID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xNTksIGFyZ3VtZW50czogYXJnc18xNjB9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE2MSA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTYxLmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE2Mikge1xuICAgIHN3aXRjaCAodGVybV8xNjIudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2Mi5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTYyLmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xNjIuaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2Mi5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xNjIubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNjIuZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2Mi5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTYyLnByb3BlcnRpZXMubWFwKHRfMTYzID0+IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE2MykpfSk7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIGxldCBsYXN0ID0gdGVybV8xNjIuZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gXCJTcHJlYWRFbGVtZW50XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE2Mi5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHRfMTY0ID0+IHRfMTY0ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTY0KSksIHJlc3RFbGVtZW50OiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdChsYXN0LmV4cHJlc3Npb24pfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjIuZWxlbWVudHMubWFwKHRfMTY1ID0+IHRfMTY1ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTY1KSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjIuZWxlbWVudHMubWFwKHRfMTY2ID0+IHRfMTY2ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE2NikpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgY2FzZSBcIlN0YXRpY1Byb3BlcnR5TmFtZVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNjIudmFsdWV9KTtcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQXJyYXlCaW5kaW5nXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ0lkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nV2l0aERlZmF1bHRcIjpcbiAgICAgIGNhc2UgXCJPYmplY3RCaW5kaW5nXCI6XG4gICAgICAgIHJldHVybiB0ZXJtXzE2MjtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yIFwiICsgdGVybV8xNjIudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTY3KSB7XG4gICAgc3dpdGNoICh0ZXJtXzE2Ny50eXBlKSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNjcuYmluZGluZyksIGluaXQ6IHRlcm1fMTY3LmV4cHJlc3Npb259KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE2Nyk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNjg7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgZW5mXzE2OCA9IG5ldyBFbmZvcmVzdGVyXzQ0KExpc3Qub2YodGhpcy5hZHZhbmNlKCkpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgZW5mXzE2OCA9IG5ldyBFbmZvcmVzdGVyXzQ0KHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtc18xNjkgPSBlbmZfMTY4LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiPT5cIik7XG4gICAgbGV0IGJvZHlfMTcwO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keV8xNzAgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmZfMTY4ID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBib2R5XzE3MCA9IGVuZl8xNjguZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mXzE2OC5yZXN0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJvd0V4cHJlc3Npb25cIiwge3BhcmFtczogcGFyYW1zXzE2OSwgYm9keTogYm9keV8xNzB9KTtcbiAgfVxuICBlbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpIHtcbiAgICBsZXQga3dkXzE3MSA9IHRoaXMubWF0Y2hLZXl3b3JkKFwieWllbGRcIik7XG4gICAgbGV0IGxvb2thaGVhZF8xNzIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE3MiAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dkXzE3MSwgbG9va2FoZWFkXzE3MikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaXNHZW5lcmF0b3IgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIqXCIpKSB7XG4gICAgICAgIGlzR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBsZXQgdHlwZSA9IGlzR2VuZXJhdG9yID8gXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiA6IFwiWWllbGRFeHByZXNzaW9uXCI7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge2V4cHJlc3Npb246IGV4cHJ9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhUZW1wbGF0ZVwiLCB7dGVtcGxhdGU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhRdW90ZSgpIHtcbiAgICBsZXQgbmFtZV8xNzMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhRdW90ZVwiLCB7bmFtZTogbmFtZV8xNzMsIHRlbXBsYXRlOiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE3M30pLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmplY3RfMTc0ID0gdGhpcy50ZXJtO1xuICAgIGxldCBkb3RfMTc1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnR5XzE3NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogb2JqZWN0XzE3NCwgcHJvcGVydHk6IHByb3BlcnR5XzE3Nn0pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCkge1xuICAgIGxldCBhcnJfMTc3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzE3OCA9IFtdO1xuICAgIGxldCBlbmZfMTc5ID0gbmV3IEVuZm9yZXN0ZXJfNDQoYXJyXzE3Ny5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xNzkucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xNzkucGVlaygpO1xuICAgICAgaWYgKGVuZl8xNzkuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xNzkuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50c18xNzgucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5mXzE3OS5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICBlbmZfMTc5LmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBlbmZfMTc5LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xNzkuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE3OC5wdXNoKG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0ZXJtID0gZW5mXzE3OS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmICh0ZXJtID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTc5LmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE3OC5wdXNoKHRlcm0pO1xuICAgICAgICBlbmZfMTc5LmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzE3OCl9KTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9ial8xODAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydGllc18xODEgPSBMaXN0KCk7XG4gICAgbGV0IGVuZl8xODIgPSBuZXcgRW5mb3Jlc3Rlcl80NChvYmpfMTgwLmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbGFzdFByb3BfMTgzID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzE4Mi5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZl8xODIuZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKTtcbiAgICAgIGVuZl8xODIuY29uc3VtZUNvbW1hKCk7XG4gICAgICBwcm9wZXJ0aWVzXzE4MSA9IHByb3BlcnRpZXNfMTgxLmNvbmNhdChwcm9wKTtcbiAgICAgIGlmIChsYXN0UHJvcF8xODMgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mXzE4Mi5jcmVhdGVFcnJvcihwcm9wLCBcImludmFsaWQgc3ludGF4IGluIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICAgIGxhc3RQcm9wXzE4MyA9IHByb3A7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXNfMTgxfSk7XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG4gICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSB0aGlzLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBcIm1ldGhvZFwiOlxuICAgICAgICByZXR1cm4gbWV0aG9kT3JLZXk7XG4gICAgICBjYXNlIFwiaWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2luaXQ6IGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSl9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlNob3J0aGFuZFByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleS52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgZXhwcl8xODQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LCBleHByZXNzaW9uOiBleHByXzE4NH0pO1xuICB9XG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE4NSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xODYgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE4NSwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xODYgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTg1LCBcImdldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiR2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE4NSwgXCJzZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJTZXR0ZXJcIiwge25hbWU6IG5hbWUsIHBhcmFtOiBwYXJhbSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJNZXRob2RcIiwge2lzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xODYsIG5hbWU6IG5hbWUsIHBhcmFtczogZm9ybWFsUGFyYW1zLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuYW1lLCBraW5kOiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTg1KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTg1KSA/IFwiaWRlbnRpZmllclwiIDogXCJwcm9wZXJ0eVwifTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5TmFtZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE4NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTg3KSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE4NykpIHtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTg3KSkge1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyXzQ0KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBleHByID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogZXhwcn0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IG5hbWVfMTg4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5hbWVfMTg4fSksIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTg4fSl9O1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwciwgaW5EZWZhdWx0LCBhbGxvd0dlbmVyYXRvcn0pIHtcbiAgICBsZXQgbmFtZV8xODkgPSBudWxsLCBwYXJhbXNfMTkwLCBib2R5XzE5MSwgcmVzdF8xOTI7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE5MyA9IGZhbHNlO1xuICAgIGxldCBmbktleXdvcmRfMTk0ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xOTUgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZV8xOTYgPSBpc0V4cHIgPyBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIDogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xOTUsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTkzID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE5NSA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE5NSkpIHtcbiAgICAgIG5hbWVfMTg5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWVfMTg5ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiKmRlZmF1bHQqXCIsIGZuS2V5d29yZF8xOTQpfSk7XG4gICAgfVxuICAgIHBhcmFtc18xOTAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xOTEgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTk3ID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zXzE5MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTk4ID0gZW5mXzE5Ny5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xOTYsIHtuYW1lOiBuYW1lXzE4OSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE5MywgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTk4LCBib2R5OiBib2R5XzE5MX0pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCkge1xuICAgIGxldCBuYW1lXzE5OSA9IG51bGwsIHBhcmFtc18yMDAsIGJvZHlfMjAxLCByZXN0XzIwMjtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMjAzID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMDQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIwNCwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8yMDMgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMjA0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjA0KSkge1xuICAgICAgbmFtZV8xOTkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcGFyYW1zXzIwMCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzIwMSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8yMDUgPSBuZXcgRW5mb3Jlc3Rlcl80NChwYXJhbXNfMjAwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18yMDYgPSBlbmZfMjA1LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xOTksIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8yMDMsIHBhcmFtczogZm9ybWFsUGFyYW1zXzIwNiwgYm9keTogYm9keV8yMDF9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IG5hbWVfMjA3LCBwYXJhbXNfMjA4LCBib2R5XzIwOSwgcmVzdF8yMTA7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzIxMSA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMjEyID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMTIsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMjExID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBuYW1lXzIwNyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIHBhcmFtc18yMDggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8yMDkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMjEzID0gbmV3IEVuZm9yZXN0ZXJfNDQocGFyYW1zXzIwOCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMjE0ID0gZW5mXzIxMy5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsIHtuYW1lOiBuYW1lXzIwNywgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIxMSwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjE0LCBib2R5OiBib2R5XzIwOX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpIHtcbiAgICBsZXQgaXRlbXNfMjE1ID0gW107XG4gICAgbGV0IHJlc3RfMjE2ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLi4uXCIpO1xuICAgICAgICByZXN0XzIxNiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGl0ZW1zXzIxNS5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBMaXN0KGl0ZW1zXzIxNSksIHJlc3Q6IHJlc3RfMjE2fSk7XG4gIH1cbiAgZW5mb3Jlc3RQYXJhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8yMTcgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiBmYWxzZSwgb3BlcmF0b3I6IG9wZXJhdG9yXzIxNy52YWwoKSwgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSl9KTtcbiAgfVxuICBlbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMjE4ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgIHRoaXMub3BDdHgucHJlYyA9IDE0O1xuICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMTkgPT4ge1xuICAgICAgbGV0IHR5cGVfMjIwLCB0ZXJtXzIyMSwgaXNQcmVmaXhfMjIyO1xuICAgICAgaWYgKG9wZXJhdG9yXzIxOC52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzIxOC52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMjIwID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMjIxID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybV8yMTkpO1xuICAgICAgICBpc1ByZWZpeF8yMjIgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZV8yMjAgPSBcIlVuYXJ5RXhwcmVzc2lvblwiO1xuICAgICAgICBpc1ByZWZpeF8yMjIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRlcm1fMjIxID0gcmlnaHRUZXJtXzIxOTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIyMCwge29wZXJhdG9yOiBvcGVyYXRvcl8yMTgudmFsKCksIG9wZXJhbmQ6IHRlcm1fMjIxLCBpc1ByZWZpeDogaXNQcmVmaXhfMjIyfSk7XG4gICAgfTtcbiAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzQxO1xuICB9XG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIGxldCB0ZXN0XzIyMyA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgIGlmICh0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj9cIik7XG4gICAgbGV0IGVuZl8yMjQgPSBuZXcgRW5mb3Jlc3Rlcl80NCh0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY29uc2VxdWVudF8yMjUgPSBlbmZfMjI0LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmZfMjI0Lm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgZW5mXzIyNCA9IG5ldyBFbmZvcmVzdGVyXzQ0KGVuZl8yMjQucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhbHRlcm5hdGVfMjI2ID0gZW5mXzIyNC5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgdGhpcy5yZXN0ID0gZW5mXzIyNC5yZXN0O1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGVzdF8yMjMsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMjI1LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8yMjZ9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRUZXJtXzIyNyA9IHRoaXMudGVybTtcbiAgICBsZXQgb3BTdHhfMjI4ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG9wXzIyOSA9IG9wU3R4XzIyOC52YWwoKTtcbiAgICBsZXQgb3BQcmVjXzIzMCA9IGdldE9wZXJhdG9yUHJlYyhvcF8yMjkpO1xuICAgIGxldCBvcEFzc29jXzIzMSA9IGdldE9wZXJhdG9yQXNzb2Mob3BfMjI5KTtcbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlY18yMzAsIG9wQXNzb2NfMjMxKSkge1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IG9wUHJlY18yMzA7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjMyID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMjI3LCBvcGVyYXRvcjogb3BTdHhfMjI4LCByaWdodDogcmlnaHRUZXJtXzIzMn0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl80MTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm1fMjI3KTtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjMzID0gdGhpcy5tYXRjaFRlbXBsYXRlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzIzNCA9IGxvb2thaGVhZF8yMzMudG9rZW4uaXRlbXMubWFwKGl0XzIzNSA9PiB7XG4gICAgICBpZiAoaXRfMjM1IGluc3RhbmNlb2YgU3ludGF4ICYmIGl0XzIzNS5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NChpdF8yMzUuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IGl0XzIzNS5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzIzNDtcbiAgfVxuICBleHBhbmRNYWNybyhlbmZvcmVzdFR5cGVfMjM2KSB7XG4gICAgbGV0IG5hbWVfMjM3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHN5bnRheFRyYW5zZm9ybV8yMzggPSB0aGlzLmdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KG5hbWVfMjM3KTtcbiAgICBpZiAoc3ludGF4VHJhbnNmb3JtXzIzOCA9PSBudWxsIHx8IHR5cGVvZiBzeW50YXhUcmFuc2Zvcm1fMjM4LnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMzcsIFwidGhlIG1hY3JvIG5hbWUgd2FzIG5vdCBib3VuZCB0byBhIHZhbHVlIHRoYXQgY291bGQgYmUgaW52b2tlZFwiKTtcbiAgICB9XG4gICAgbGV0IHVzZVNpdGVTY29wZV8yMzkgPSBmcmVzaFNjb3BlKFwidVwiKTtcbiAgICBsZXQgaW50cm9kdWNlZFNjb3BlXzI0MCA9IGZyZXNoU2NvcGUoXCJpXCIpO1xuICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZV8yMzk7XG4gICAgbGV0IGN0eF8yNDEgPSBuZXcgTWFjcm9Db250ZXh0KHRoaXMsIG5hbWVfMjM3LCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZV8yMzksIGludHJvZHVjZWRTY29wZV8yNDApO1xuICAgIGxldCByZXN1bHRfMjQyID0gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhzeW50YXhUcmFuc2Zvcm1fMjM4LnZhbHVlLmNhbGwobnVsbCwgY3R4XzI0MSkpO1xuICAgIGlmICghTGlzdC5pc0xpc3QocmVzdWx0XzI0MikpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMzcsIFwibWFjcm8gbXVzdCByZXR1cm4gYSBsaXN0IGJ1dCBnb3Q6IFwiICsgcmVzdWx0XzI0Mik7XG4gICAgfVxuICAgIHJlc3VsdF8yNDIgPSByZXN1bHRfMjQyLm1hcChzdHhfMjQzID0+IHtcbiAgICAgIGlmICghKHN0eF8yNDMgJiYgdHlwZW9mIHN0eF8yNDMuYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIzNywgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eF8yNDMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eF8yNDMuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlXzI0MCwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRfMjQyO1xuICB9XG4gIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NCAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ0LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDUgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ1LCBcIixcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBpc1Rlcm0odGVybV8yNDYpIHtcbiAgICByZXR1cm4gdGVybV8yNDYgJiYgdGVybV8yNDYgaW5zdGFuY2VvZiBUZXJtO1xuICB9XG4gIGlzRU9GKHRlcm1fMjQ3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ3ICYmIHRlcm1fMjQ3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQ3LmlzRU9GKCk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHRlcm1fMjQ4LCB2YWxfMjQ5ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI0OCAmJiB0ZXJtXzI0OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0OC5pc0lkZW50aWZpZXIoKSAmJiAodmFsXzI0OSA9PT0gbnVsbCB8fCB0ZXJtXzI0OC52YWwoKSA9PT0gdmFsXzI0OSk7XG4gIH1cbiAgaXNQcm9wZXJ0eU5hbWUodGVybV8yNTApIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWZpZXIodGVybV8yNTApIHx8IHRoaXMuaXNLZXl3b3JkKHRlcm1fMjUwKSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwodGVybV8yNTApIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKHRlcm1fMjUwKSB8fCB0aGlzLmlzQnJhY2tldHModGVybV8yNTApO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodGVybV8yNTEpIHtcbiAgICByZXR1cm4gdGVybV8yNTEgJiYgdGVybV8yNTEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNTEuaXNOdW1lcmljTGl0ZXJhbCgpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzI1Mikge1xuICAgIHJldHVybiB0ZXJtXzI1MiAmJiB0ZXJtXzI1MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1Mi5pc1N0cmluZ0xpdGVyYWwoKTtcbiAgfVxuICBpc1RlbXBsYXRlKHRlcm1fMjUzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUzICYmIHRlcm1fMjUzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjUzLmlzVGVtcGxhdGUoKTtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKHRlcm1fMjU0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU0ICYmIHRlcm1fMjU0IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU0LmlzQm9vbGVhbkxpdGVyYWwoKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHRlcm1fMjU1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU1ICYmIHRlcm1fMjU1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU1LmlzTnVsbExpdGVyYWwoKTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHRlcm1fMjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU2ICYmIHRlcm1fMjU2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU2LmlzUmVndWxhckV4cHJlc3Npb24oKTtcbiAgfVxuICBpc1BhcmVucyh0ZXJtXzI1Nykge1xuICAgIHJldHVybiB0ZXJtXzI1NyAmJiB0ZXJtXzI1NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1Ny5pc1BhcmVucygpO1xuICB9XG4gIGlzQnJhY2VzKHRlcm1fMjU4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU4ICYmIHRlcm1fMjU4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU4LmlzQnJhY2VzKCk7XG4gIH1cbiAgaXNCcmFja2V0cyh0ZXJtXzI1OSkge1xuICAgIHJldHVybiB0ZXJtXzI1OSAmJiB0ZXJtXzI1OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1OS5pc0JyYWNrZXRzKCk7XG4gIH1cbiAgaXNBc3NpZ24odGVybV8yNjApIHtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGVybV8yNjApKSB7XG4gICAgICBzd2l0Y2ggKHRlcm1fMjYwLnZhbCgpKSB7XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgICBjYXNlIFwiXj1cIjpcbiAgICAgICAgY2FzZSBcIiY9XCI6XG4gICAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgICBjYXNlIFwiPj4+PVwiOlxuICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgY2FzZSBcIi09XCI6XG4gICAgICAgIGNhc2UgXCIqPVwiOlxuICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaXNLZXl3b3JkKHRlcm1fMjYxLCB2YWxfMjYyID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI2MSAmJiB0ZXJtXzI2MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI2MS5pc0tleXdvcmQoKSAmJiAodmFsXzI2MiA9PT0gbnVsbCB8fCB0ZXJtXzI2MS52YWwoKSA9PT0gdmFsXzI2Mik7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHRlcm1fMjYzLCB2YWxfMjY0ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI2MyAmJiB0ZXJtXzI2MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI2My5pc1B1bmN0dWF0b3IoKSAmJiAodmFsXzI2NCA9PT0gbnVsbCB8fCB0ZXJtXzI2My52YWwoKSA9PT0gdmFsXzI2NCk7XG4gIH1cbiAgaXNPcGVyYXRvcih0ZXJtXzI2NSkge1xuICAgIHJldHVybiB0ZXJtXzI2NSAmJiB0ZXJtXzI2NSBpbnN0YW5jZW9mIFN5bnRheCAmJiBpc09wZXJhdG9yKHRlcm1fMjY1KTtcbiAgfVxuICBpc1VwZGF0ZU9wZXJhdG9yKHRlcm1fMjY2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY2ICYmIHRlcm1fMjY2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjY2LmlzUHVuY3R1YXRvcigpICYmICh0ZXJtXzI2Ni52YWwoKSA9PT0gXCIrK1wiIHx8IHRlcm1fMjY2LnZhbCgpID09PSBcIi0tXCIpO1xuICB9XG4gIGlzRm5EZWNsVHJhbnNmb3JtKHRlcm1fMjY3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY3ICYmIHRlcm1fMjY3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY3LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IEZ1bmN0aW9uRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1ZhckRlY2xUcmFuc2Zvcm0odGVybV8yNjgpIHtcbiAgICByZXR1cm4gdGVybV8yNjggJiYgdGVybV8yNjggaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzTGV0RGVjbFRyYW5zZm9ybSh0ZXJtXzI2OSkge1xuICAgIHJldHVybiB0ZXJtXzI2OSAmJiB0ZXJtXzI2OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBMZXREZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKHRlcm1fMjcwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjcwICYmIHRlcm1fMjcwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjcwLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheERlY2xUcmFuc2Zvcm0odGVybV8yNzEpIHtcbiAgICByZXR1cm4gdGVybV8yNzEgJiYgdGVybV8yNzEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzEucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0odGVybV8yNzIpIHtcbiAgICByZXR1cm4gdGVybV8yNzIgJiYgdGVybV8yNzIgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzIucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHRlcm1fMjczKSB7XG4gICAgcmV0dXJuIHRlcm1fMjczICYmIHRlcm1fMjczIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjczLmlzU3ludGF4VGVtcGxhdGUoKTtcbiAgfVxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKHRlcm1fMjc0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjc0ICYmIHRlcm1fMjc0IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjc0LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IFN5bnRheFF1b3RlVHJhbnNmb3JtO1xuICB9XG4gIGlzUmV0dXJuU3RtdFRyYW5zZm9ybSh0ZXJtXzI3NSkge1xuICAgIHJldHVybiB0ZXJtXzI3NSAmJiB0ZXJtXzI3NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3NS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaGlsZVRyYW5zZm9ybSh0ZXJtXzI3Nikge1xuICAgIHJldHVybiB0ZXJtXzI3NiAmJiB0ZXJtXzI3NiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3Ni5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBXaGlsZVRyYW5zZm9ybTtcbiAgfVxuICBpc0ZvclRyYW5zZm9ybSh0ZXJtXzI3Nykge1xuICAgIHJldHVybiB0ZXJtXzI3NyAmJiB0ZXJtXzI3NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI3Ny5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBGb3JUcmFuc2Zvcm07XG4gIH1cbiAgaXNTd2l0Y2hUcmFuc2Zvcm0odGVybV8yNzgpIHtcbiAgICByZXR1cm4gdGVybV8yNzggJiYgdGVybV8yNzggaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gU3dpdGNoVHJhbnNmb3JtO1xuICB9XG4gIGlzQnJlYWtUcmFuc2Zvcm0odGVybV8yNzkpIHtcbiAgICByZXR1cm4gdGVybV8yNzkgJiYgdGVybV8yNzkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzkucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gQnJlYWtUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb250aW51ZVRyYW5zZm9ybSh0ZXJtXzI4MCkge1xuICAgIHJldHVybiB0ZXJtXzI4MCAmJiB0ZXJtXzI4MCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4MC5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBDb250aW51ZVRyYW5zZm9ybTtcbiAgfVxuICBpc0RvVHJhbnNmb3JtKHRlcm1fMjgxKSB7XG4gICAgcmV0dXJuIHRlcm1fMjgxICYmIHRlcm1fMjgxIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjgxLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IERvVHJhbnNmb3JtO1xuICB9XG4gIGlzRGVidWdnZXJUcmFuc2Zvcm0odGVybV8yODIpIHtcbiAgICByZXR1cm4gdGVybV8yODIgJiYgdGVybV8yODIgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODIucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gRGVidWdnZXJUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaXRoVHJhbnNmb3JtKHRlcm1fMjgzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjgzICYmIHRlcm1fMjgzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjgzLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgPT09IFdpdGhUcmFuc2Zvcm07XG4gIH1cbiAgaXNUcnlUcmFuc2Zvcm0odGVybV8yODQpIHtcbiAgICByZXR1cm4gdGVybV8yODQgJiYgdGVybV8yODQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODQucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVHJ5VHJhbnNmb3JtO1xuICB9XG4gIGlzVGhyb3dUcmFuc2Zvcm0odGVybV8yODUpIHtcbiAgICByZXR1cm4gdGVybV8yODUgJiYgdGVybV8yODUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSA9PT0gVGhyb3dUcmFuc2Zvcm07XG4gIH1cbiAgaXNJZlRyYW5zZm9ybSh0ZXJtXzI4Nikge1xuICAgIHJldHVybiB0ZXJtXzI4NiAmJiB0ZXJtXzI4NiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4Ni5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBJZlRyYW5zZm9ybTtcbiAgfVxuICBpc05ld1RyYW5zZm9ybSh0ZXJtXzI4Nykge1xuICAgIHJldHVybiB0ZXJtXzI4NyAmJiB0ZXJtXzI4NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI4Ny5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpID09PSBOZXdUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI4OCkge1xuICAgIHJldHVybiB0ZXJtXzI4OCAmJiB0ZXJtXzI4OCBpbnN0YW5jZW9mIFN5bnRheCAmJiAodGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yODgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yODgucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuICBpc1ZhckJpbmRpbmdUcmFuc2Zvcm0odGVybV8yODkpIHtcbiAgICByZXR1cm4gdGVybV8yODkgJiYgdGVybV8yODkgaW5zdGFuY2VvZiBTeW50YXggJiYgKHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjg5LnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkgaW5zdGFuY2VvZiBWYXJCaW5kaW5nVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yODkucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSBpbnN0YW5jZW9mIFZhckJpbmRpbmdUcmFuc2Zvcm0pO1xuICB9XG4gIGdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KHRlcm1fMjkwKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5lbnYuaGFzKHRlcm1fMjkwLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI5MC5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LnN0b3JlLmdldCh0ZXJtXzI5MC5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICB9XG4gIGxpbmVOdW1iZXJFcShhXzI5MSwgYl8yOTIpIHtcbiAgICBpZiAoIShhXzI5MSAmJiBiXzI5MikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGFfMjkxLmxpbmVOdW1iZXIoKSA9PT0gYl8yOTIubGluZU51bWJlcigpO1xuICB9XG4gIG1hdGNoSWRlbnRpZmllcih2YWxfMjkzKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yOTQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzI5NCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjk0O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yOTQsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgbWF0Y2hLZXl3b3JkKHZhbF8yOTUpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI5NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMjk2LCB2YWxfMjk1KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTY7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5NiwgXCJleHBlY3RpbmcgXCIgKyB2YWxfMjk1KTtcbiAgfVxuICBtYXRjaExpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yOTcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8yOTcpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yOTcpIHx8IHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMjk3KSB8fCB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzI5NykgfHwgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yOTcpIHx8IHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMjk3KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTc7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5NywgXCJleHBlY3RpbmcgYSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoU3RyaW5nTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI5OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMjk4KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTg7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5OCwgXCJleHBlY3RpbmcgYSBzdHJpbmcgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFRlbXBsYXRlKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjk5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMjk5KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yOTk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI5OSwgXCJleHBlY3RpbmcgYSB0ZW1wbGF0ZSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoUGFyZW5zKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzAwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzMwMCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzAwLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwMCwgXCJleHBlY3RpbmcgcGFyZW5zXCIpO1xuICB9XG4gIG1hdGNoQ3VybGllcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMwMSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8zMDEpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMwMS5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDEsIFwiZXhwZWN0aW5nIGN1cmx5IGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFNxdWFyZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMDIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8zMDIpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMwMi5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDIsIFwiZXhwZWN0aW5nIHNxYXVyZSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hVbmFyeU9wZXJhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzAzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKGlzVW5hcnlPcGVyYXRvcihsb29rYWhlYWRfMzAzKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDM7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwMywgXCJleHBlY3RpbmcgYSB1bmFyeSBvcGVyYXRvclwiKTtcbiAgfVxuICBtYXRjaFB1bmN0dWF0b3IodmFsXzMwNCkge1xuICAgIGxldCBsb29rYWhlYWRfMzA1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8zMDUpKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbF8zMDQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKGxvb2thaGVhZF8zMDUudmFsKCkgPT09IHZhbF8zMDQpIHtcbiAgICAgICAgICByZXR1cm4gbG9va2FoZWFkXzMwNTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMDUsIFwiZXhwZWN0aW5nIGEgXCIgKyB2YWxfMzA0ICsgXCIgcHVuY3R1YXRvclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMDU7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMwNSwgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGNyZWF0ZUVycm9yKHN0eF8zMDYsIG1lc3NhZ2VfMzA3KSB7XG4gICAgbGV0IGN0eF8zMDggPSBcIlwiO1xuICAgIGxldCBvZmZlbmRpbmdfMzA5ID0gc3R4XzMwNjtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBjdHhfMzA4ID0gdGhpcy5yZXN0LnNsaWNlKDAsIDIwKS5tYXAodGVybV8zMTAgPT4ge1xuICAgICAgICBpZiAodGVybV8zMTAuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiB0ZXJtXzMxMC5pbm5lcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMaXN0Lm9mKHRlcm1fMzEwKTtcbiAgICAgIH0pLmZsYXR0ZW4oKS5tYXAoc18zMTEgPT4ge1xuICAgICAgICBpZiAoc18zMTEgPT09IG9mZmVuZGluZ18zMDkpIHtcbiAgICAgICAgICByZXR1cm4gXCJfX1wiICsgc18zMTEudmFsKCkgKyBcIl9fXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNfMzExLnZhbCgpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eF8zMDggPSBvZmZlbmRpbmdfMzA5LnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZV8zMDcgKyBcIlxcblwiICsgY3R4XzMwOCk7XG4gIH1cbn1cbmV4cG9ydCB7RW5mb3Jlc3Rlcl80NCBhcyBFbmZvcmVzdGVyfSJdfQ==