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
class Enforester {
  constructor(stxl_44, prev_45, context_46) {
    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl_44), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev_45), "expecting a list of terms to enforest");
    (0, _errors.assert)(context_46, "expecting a context to enforest");
    this.term = null;
    this.rest = stxl_44;
    this.prev = prev_45;
    this.context = context_46;
  }
  peek() {
    let n_47 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    return this.rest.get(n_47);
  }
  advance() {
    let ret_48 = this.rest.first();
    this.rest = this.rest.rest();
    return ret_48;
  }
  enforest() {
    let type_49 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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
    let result_50;
    if (type_49 === "expression") {
      result_50 = this.enforestExpressionLoop();
    } else {
      result_50 = this.enforestModule();
    }
    if (this.rest.size === 0) {
      this.done = true;
    }
    return result_50;
  }
  enforestModule() {
    return this.enforestBody();
  }
  enforestBody() {
    return this.enforestModuleItem();
  }
  enforestModuleItem() {
    let lookahead_51 = this.peek();
    if (this.isKeyword(lookahead_51, "import")) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isKeyword(lookahead_51, "export")) {
      this.advance();
      return this.enforestExportDeclaration();
    } else if (this.isIdentifier(lookahead_51, "#")) {
      return this.enforestLanguagePragma();
    }
    return this.enforestStatement();
  }
  enforestLanguagePragma() {
    this.matchIdentifier("#");
    this.matchIdentifier("lang");
    let path_52 = this.matchStringLiteral();
    this.consumeSemicolon();
    return new _terms2.default("Pragma", { kind: "lang", items: _immutable.List.of(path_52) });
  }
  enforestExportDeclaration() {
    let lookahead_53 = this.peek();
    if (this.isPunctuator(lookahead_53, "*")) {
      this.advance();
      let moduleSpecifier = this.enforestFromClause();
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
    } else if (this.isBraces(lookahead_53)) {
      let namedExports = this.enforestExportClause();
      let moduleSpecifier = null;
      if (this.isIdentifier(this.peek(), "from")) {
        moduleSpecifier = this.enforestFromClause();
      }
      return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: moduleSpecifier });
    } else if (this.isKeyword(lookahead_53, "class")) {
      return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
    } else if (this.isFnDeclTransform(lookahead_53)) {
      return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
    } else if (this.isKeyword(lookahead_53, "default")) {
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
    } else if (this.isVarDeclTransform(lookahead_53) || this.isLetDeclTransform(lookahead_53) || this.isConstDeclTransform(lookahead_53) || this.isSyntaxrecDeclTransform(lookahead_53) || this.isSyntaxDeclTransform(lookahead_53)) {
      return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
    }
    throw this.createError(lookahead_53, "unexpected syntax");
  }
  enforestExportClause() {
    let enf_54 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_55 = [];
    while (enf_54.rest.size !== 0) {
      result_55.push(enf_54.enforestExportSpecifier());
      enf_54.consumeComma();
    }
    return (0, _immutable.List)(result_55);
  }
  enforestExportSpecifier() {
    let name_56 = this.enforestIdentifier();
    if (this.isIdentifier(this.peek(), "as")) {
      this.advance();
      let exportedName = this.enforestIdentifier();
      return new _terms2.default("ExportSpecifier", { name: name_56, exportedName: exportedName });
    }
    return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_56 });
  }
  enforestImportDeclaration() {
    let lookahead_57 = this.peek();
    let defaultBinding_58 = null;
    let namedImports_59 = (0, _immutable.List)();
    let forSyntax_60 = false;
    if (this.isStringLiteral(lookahead_57)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new _terms2.default("Import", { defaultBinding: defaultBinding_58, namedImports: namedImports_59, moduleSpecifier: moduleSpecifier });
    }
    if (this.isIdentifier(lookahead_57) || this.isKeyword(lookahead_57)) {
      defaultBinding_58 = this.enforestBindingIdentifier();
      if (!this.isPunctuator(this.peek(), ",")) {
        let moduleSpecifier = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_60 = true;
        }
        return new _terms2.default("Import", { defaultBinding: defaultBinding_58, moduleSpecifier: moduleSpecifier, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_60 });
      }
    }
    this.consumeComma();
    lookahead_57 = this.peek();
    if (this.isBraces(lookahead_57)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_60 = true;
      }
      return new _terms2.default("Import", { defaultBinding: defaultBinding_58, forSyntax: forSyntax_60, namedImports: imports, moduleSpecifier: fromClause });
    } else if (this.isPunctuator(lookahead_57, "*")) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_60 = true;
      }
      return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_58, forSyntax: forSyntax_60, namespaceBinding: namespaceBinding, moduleSpecifier: moduleSpecifier });
    }
    throw this.createError(lookahead_57, "unexpected syntax");
  }
  enforestNamespaceBinding() {
    this.matchPunctuator("*");
    this.matchIdentifier("as");
    return this.enforestBindingIdentifier();
  }
  enforestNamedImports() {
    let enf_61 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_62 = [];
    while (enf_61.rest.size !== 0) {
      result_62.push(enf_61.enforestImportSpecifiers());
      enf_61.consumeComma();
    }
    return (0, _immutable.List)(result_62);
  }
  enforestImportSpecifiers() {
    let lookahead_63 = this.peek();
    let name_64;
    if (this.isIdentifier(lookahead_63) || this.isKeyword(lookahead_63)) {
      name_64 = this.advance();
      if (!this.isIdentifier(this.peek(), "as")) {
        return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_64 }) });
      } else {
        this.matchIdentifier("as");
      }
    } else {
      throw this.createError(lookahead_63, "unexpected token in import specifier");
    }
    return new _terms2.default("ImportSpecifier", { name: name_64, binding: this.enforestBindingIdentifier() });
  }
  enforestFromClause() {
    this.matchIdentifier("from");
    let lookahead_65 = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead_65;
  }
  enforestStatementListItem() {
    let lookahead_66 = this.peek();
    if (this.isFnDeclTransform(lookahead_66)) {
      return this.enforestFunctionDeclaration({ isExpr: false });
    } else if (this.isKeyword(lookahead_66, "class")) {
      return this.enforestClass({ isExpr: false });
    } else {
      return this.enforestStatement();
    }
  }
  enforestStatement() {
    let lookahead_67 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_67)) {
      this.rest = this.expandMacro().concat(this.rest);
      lookahead_67 = this.peek();
      this.term = null;
    }
    if (this.term === null && this.isBraces(lookahead_67)) {
      return this.enforestBlockStatement();
    }
    if (this.term === null && this.isWhileTransform(lookahead_67)) {
      return this.enforestWhileStatement();
    }
    if (this.term === null && this.isIfTransform(lookahead_67)) {
      return this.enforestIfStatement();
    }
    if (this.term === null && this.isForTransform(lookahead_67)) {
      return this.enforestForStatement();
    }
    if (this.term === null && this.isSwitchTransform(lookahead_67)) {
      return this.enforestSwitchStatement();
    }
    if (this.term === null && this.isBreakTransform(lookahead_67)) {
      return this.enforestBreakStatement();
    }
    if (this.term === null && this.isContinueTransform(lookahead_67)) {
      return this.enforestContinueStatement();
    }
    if (this.term === null && this.isDoTransform(lookahead_67)) {
      return this.enforestDoStatement();
    }
    if (this.term === null && this.isDebuggerTransform(lookahead_67)) {
      return this.enforestDebuggerStatement();
    }
    if (this.term === null && this.isWithTransform(lookahead_67)) {
      return this.enforestWithStatement();
    }
    if (this.term === null && this.isTryTransform(lookahead_67)) {
      return this.enforestTryStatement();
    }
    if (this.term === null && this.isThrowTransform(lookahead_67)) {
      return this.enforestThrowStatement();
    }
    if (this.term === null && this.isKeyword(lookahead_67, "class")) {
      return this.enforestClass({ isExpr: false });
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_67)) {
      return this.enforestFunctionDeclaration();
    }
    if (this.term === null && this.isIdentifier(lookahead_67) && this.isPunctuator(this.peek(1), ":")) {
      return this.enforestLabeledStatement();
    }
    if (this.term === null && (this.isVarDeclTransform(lookahead_67) || this.isLetDeclTransform(lookahead_67) || this.isConstDeclTransform(lookahead_67) || this.isSyntaxrecDeclTransform(lookahead_67) || this.isSyntaxDeclTransform(lookahead_67))) {
      let stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });
      this.consumeSemicolon();
      return stmt;
    }
    if (this.term === null && this.isReturnStmtTransform(lookahead_67)) {
      return this.enforestReturnStatement();
    }
    if (this.term === null && this.isPunctuator(lookahead_67, ";")) {
      this.advance();
      return new _terms2.default("EmptyStatement", {});
    }
    return this.enforestExpressionStatement();
  }
  enforestLabeledStatement() {
    let label_68 = this.matchIdentifier();
    let punc_69 = this.matchPunctuator(":");
    let stmt_70 = this.enforestStatement();
    return new _terms2.default("LabeledStatement", { label: label_68, body: stmt_70 });
  }
  enforestBreakStatement() {
    this.matchKeyword("break");
    let lookahead_71 = this.peek();
    let label_72 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_71, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("BreakStatement", { label: label_72 });
    }
    if (this.isIdentifier(lookahead_71) || this.isKeyword(lookahead_71, "yield") || this.isKeyword(lookahead_71, "let")) {
      label_72 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("BreakStatement", { label: label_72 });
  }
  enforestTryStatement() {
    this.matchKeyword("try");
    let body_73 = this.enforestBlock();
    if (this.isKeyword(this.peek(), "catch")) {
      let catchClause = this.enforestCatchClause();
      if (this.isKeyword(this.peek(), "finally")) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_73, catchClause: catchClause, finalizer: finalizer });
      }
      return new _terms2.default("TryCatchStatement", { body: body_73, catchClause: catchClause });
    }
    if (this.isKeyword(this.peek(), "finally")) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new _terms2.default("TryFinallyStatement", { body: body_73, catchClause: null, finalizer: finalizer });
    }
    throw this.createError(this.peek(), "try with no catch or finally");
  }
  enforestCatchClause() {
    this.matchKeyword("catch");
    let bindingParens_74 = this.matchParens();
    let enf_75 = new Enforester(bindingParens_74, (0, _immutable.List)(), this.context);
    let binding_76 = enf_75.enforestBindingTarget();
    let body_77 = this.enforestBlock();
    return new _terms2.default("CatchClause", { binding: binding_76, body: body_77 });
  }
  enforestThrowStatement() {
    this.matchKeyword("throw");
    let expression_78 = this.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("ThrowStatement", { expression: expression_78 });
  }
  enforestWithStatement() {
    this.matchKeyword("with");
    let objParens_79 = this.matchParens();
    let enf_80 = new Enforester(objParens_79, (0, _immutable.List)(), this.context);
    let object_81 = enf_80.enforestExpression();
    let body_82 = this.enforestStatement();
    return new _terms2.default("WithStatement", { object: object_81, body: body_82 });
  }
  enforestDebuggerStatement() {
    this.matchKeyword("debugger");
    return new _terms2.default("DebuggerStatement", {});
  }
  enforestDoStatement() {
    this.matchKeyword("do");
    let body_83 = this.enforestStatement();
    this.matchKeyword("while");
    let testBody_84 = this.matchParens();
    let enf_85 = new Enforester(testBody_84, (0, _immutable.List)(), this.context);
    let test_86 = enf_85.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("DoWhileStatement", { body: body_83, test: test_86 });
  }
  enforestContinueStatement() {
    let kwd_87 = this.matchKeyword("continue");
    let lookahead_88 = this.peek();
    let label_89 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_88, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("ContinueStatement", { label: label_89 });
    }
    if (this.lineNumberEq(kwd_87, lookahead_88) && (this.isIdentifier(lookahead_88) || this.isKeyword(lookahead_88, "yield") || this.isKeyword(lookahead_88, "let"))) {
      label_89 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("ContinueStatement", { label: label_89 });
  }
  enforestSwitchStatement() {
    this.matchKeyword("switch");
    let cond_90 = this.matchParens();
    let enf_91 = new Enforester(cond_90, (0, _immutable.List)(), this.context);
    let discriminant_92 = enf_91.enforestExpression();
    let body_93 = this.matchCurlies();
    if (body_93.size === 0) {
      return new _terms2.default("SwitchStatement", { discriminant: discriminant_92, cases: (0, _immutable.List)() });
    }
    enf_91 = new Enforester(body_93, (0, _immutable.List)(), this.context);
    let cases_94 = enf_91.enforestSwitchCases();
    let lookahead_95 = enf_91.peek();
    if (enf_91.isKeyword(lookahead_95, "default")) {
      let defaultCase = enf_91.enforestSwitchDefault();
      let postDefaultCases = enf_91.enforestSwitchCases();
      return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_92, preDefaultCases: cases_94, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
    }
    return new _terms2.default("SwitchStatement", { discriminant: discriminant_92, cases: cases_94 });
  }
  enforestSwitchCases() {
    let cases_96 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
      cases_96.push(this.enforestSwitchCase());
    }
    return (0, _immutable.List)(cases_96);
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
    let result_97 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
      result_97.push(this.enforestStatementListItem());
    }
    return (0, _immutable.List)(result_97);
  }
  enforestSwitchDefault() {
    this.matchKeyword("default");
    return new _terms2.default("SwitchDefault", { consequent: this.enforestSwitchCaseBody() });
  }
  enforestForStatement() {
    this.matchKeyword("for");
    let cond_98 = this.matchParens();
    let enf_99 = new Enforester(cond_98, (0, _immutable.List)(), this.context);
    let lookahead_100, test_101, init_102, right_103, type_104, left_105, update_106;
    if (enf_99.isPunctuator(enf_99.peek(), ";")) {
      enf_99.advance();
      if (!enf_99.isPunctuator(enf_99.peek(), ";")) {
        test_101 = enf_99.enforestExpression();
      }
      enf_99.matchPunctuator(";");
      if (enf_99.rest.size !== 0) {
        right_103 = enf_99.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: null, test: test_101, update: right_103, body: this.enforestStatement() });
    } else {
      lookahead_100 = enf_99.peek();
      if (enf_99.isVarDeclTransform(lookahead_100) || enf_99.isLetDeclTransform(lookahead_100) || enf_99.isConstDeclTransform(lookahead_100)) {
        init_102 = enf_99.enforestVariableDeclaration();
        lookahead_100 = enf_99.peek();
        if (this.isKeyword(lookahead_100, "in") || this.isIdentifier(lookahead_100, "of")) {
          if (this.isKeyword(lookahead_100, "in")) {
            enf_99.advance();
            right_103 = enf_99.enforestExpression();
            type_104 = "ForInStatement";
          } else if (this.isIdentifier(lookahead_100, "of")) {
            enf_99.advance();
            right_103 = enf_99.enforestExpression();
            type_104 = "ForOfStatement";
          }
          return new _terms2.default(type_104, { left: init_102, right: right_103, body: this.enforestStatement() });
        }
        enf_99.matchPunctuator(";");
        if (enf_99.isPunctuator(enf_99.peek(), ";")) {
          enf_99.advance();
          test_101 = null;
        } else {
          test_101 = enf_99.enforestExpression();
          enf_99.matchPunctuator(";");
        }
        update_106 = enf_99.enforestExpression();
      } else {
        if (this.isKeyword(enf_99.peek(1), "in") || this.isIdentifier(enf_99.peek(1), "of")) {
          left_105 = enf_99.enforestBindingIdentifier();
          let kind = enf_99.advance();
          if (this.isKeyword(kind, "in")) {
            type_104 = "ForInStatement";
          } else {
            type_104 = "ForOfStatement";
          }
          right_103 = enf_99.enforestExpression();
          return new _terms2.default(type_104, { left: left_105, right: right_103, body: this.enforestStatement() });
        }
        init_102 = enf_99.enforestExpression();
        enf_99.matchPunctuator(";");
        if (enf_99.isPunctuator(enf_99.peek(), ";")) {
          enf_99.advance();
          test_101 = null;
        } else {
          test_101 = enf_99.enforestExpression();
          enf_99.matchPunctuator(";");
        }
        update_106 = enf_99.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: init_102, test: test_101, update: update_106, body: this.enforestStatement() });
    }
  }
  enforestIfStatement() {
    this.matchKeyword("if");
    let cond_107 = this.matchParens();
    let enf_108 = new Enforester(cond_107, (0, _immutable.List)(), this.context);
    let lookahead_109 = enf_108.peek();
    let test_110 = enf_108.enforestExpression();
    if (test_110 === null) {
      throw enf_108.createError(lookahead_109, "expecting an expression");
    }
    let consequent_111 = this.enforestStatement();
    let alternate_112 = null;
    if (this.isKeyword(this.peek(), "else")) {
      this.advance();
      alternate_112 = this.enforestStatement();
    }
    return new _terms2.default("IfStatement", { test: test_110, consequent: consequent_111, alternate: alternate_112 });
  }
  enforestWhileStatement() {
    this.matchKeyword("while");
    let cond_113 = this.matchParens();
    let enf_114 = new Enforester(cond_113, (0, _immutable.List)(), this.context);
    let lookahead_115 = enf_114.peek();
    let test_116 = enf_114.enforestExpression();
    if (test_116 === null) {
      throw enf_114.createError(lookahead_115, "expecting an expression");
    }
    let body_117 = this.enforestStatement();
    return new _terms2.default("WhileStatement", { test: test_116, body: body_117 });
  }
  enforestBlockStatement() {
    return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
  }
  enforestBlock() {
    let b_118 = this.matchCurlies();
    let body_119 = [];
    let enf_120 = new Enforester(b_118, (0, _immutable.List)(), this.context);
    while (enf_120.rest.size !== 0) {
      let lookahead = enf_120.peek();
      let stmt = enf_120.enforestStatement();
      if (stmt == null) {
        throw enf_120.createError(lookahead, "not a statement");
      }
      body_119.push(stmt);
    }
    return new _terms2.default("Block", { statements: (0, _immutable.List)(body_119) });
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
    let enf_126 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
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
    let enf_128 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
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
    let enf_132 = new Enforester(bracket_131, (0, _immutable.List)(), this.context);
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
      let enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
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
    let lookahead_156 = this.peek();
    if (this.term === null && this.isTerm(lookahead_156)) {
      return this.advance();
    }
    if (this.term === null && this.isCompiletimeTransform(lookahead_156)) {
      let result = this.expandMacro();
      this.rest = result.concat(this.rest);
      return EXPR_LOOP_EXPANSION_43;
    }
    if (this.term === null && this.isKeyword(lookahead_156, "yield")) {
      return this.enforestYieldExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_156, "class")) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && this.isKeyword(lookahead_156, "super")) {
      this.advance();
      return new _terms2.default("Super", {});
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
    if (this.term === null && this.isNewTransform(lookahead_156)) {
      return this.enforestNewExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_156, "this")) {
      return new _terms2.default("ThisExpression", { stx: this.advance() });
    }
    if (this.term === null && (this.isIdentifier(lookahead_156) || this.isKeyword(lookahead_156, "let") || this.isKeyword(lookahead_156, "yield"))) {
      return new _terms2.default("IdentifierExpression", { name: this.advance() });
    }
    if (this.term === null && this.isNumericLiteral(lookahead_156)) {
      let num = this.advance();
      if (num.val() === 1 / 0) {
        return new _terms2.default("LiteralInfinityExpression", {});
      }
      return new _terms2.default("LiteralNumericExpression", { value: num });
    }
    if (this.term === null && this.isStringLiteral(lookahead_156)) {
      return new _terms2.default("LiteralStringExpression", { value: this.advance() });
    }
    if (this.term === null && this.isTemplate(lookahead_156)) {
      return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
    }
    if (this.term === null && this.isBooleanLiteral(lookahead_156)) {
      return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
    }
    if (this.term === null && this.isNullLiteral(lookahead_156)) {
      this.advance();
      return new _terms2.default("LiteralNullExpression", {});
    }
    if (this.term === null && this.isRegularExpression(lookahead_156)) {
      let reStx = this.advance();
      let lastSlash = reStx.token.value.lastIndexOf("/");
      let pattern = reStx.token.value.slice(1, lastSlash);
      let flags = reStx.token.value.slice(lastSlash + 1);
      return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
    }
    if (this.term === null && this.isParens(lookahead_156)) {
      return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_156)) {
      return this.enforestFunctionExpression();
    }
    if (this.term === null && this.isBraces(lookahead_156)) {
      return this.enforestObjectExpression();
    }
    if (this.term === null && this.isBrackets(lookahead_156)) {
      return this.enforestArrayExpression();
    }
    if (this.term === null && this.isOperator(lookahead_156)) {
      return this.enforestUnaryExpression();
    }
    if (this.term === null && this.isVarBindingTransform(lookahead_156)) {
      let id = this.getFromCompiletimeEnvironment(lookahead_156).id;
      if (id !== lookahead_156) {
        this.advance();
        this.rest = _immutable.List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION_43;
      }
    }
    if (this.term && this.isUpdateOperator(lookahead_156)) {
      return this.enforestUpdateExpression();
    }
    if (this.term && this.isOperator(lookahead_156)) {
      return this.enforestBinaryExpression();
    }
    if (this.term && this.isPunctuator(lookahead_156, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
      return this.enforestStaticMemberExpression();
    }
    if (this.term && this.isBrackets(lookahead_156)) {
      return this.enforestComputedMemberExpression();
    }
    if (this.term && this.isParens(lookahead_156)) {
      let paren = this.advance();
      return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
    }
    if (this.term && this.isTemplate(lookahead_156)) {
      return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
    }
    if (this.term && this.isAssign(lookahead_156)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.advance();
      let enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
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
    return EXPR_LOOP_NO_CHANGE_42;
  }
  enforestArgumentList() {
    let result_157 = [];
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
      result_157.push(arg);
    }
    return (0, _immutable.List)(result_157);
  }
  enforestNewExpression() {
    this.matchKeyword("new");
    let callee_158;
    if (this.isKeyword(this.peek(), "new")) {
      callee_158 = this.enforestNewExpression();
    } else if (this.isKeyword(this.peek(), "super")) {
      callee_158 = this.enforestExpressionLoop();
    } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
      this.advance();
      this.advance();
      return new _terms2.default("NewTargetExpression", {});
    } else {
      callee_158 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
    }
    let args_159;
    if (this.isParens(this.peek())) {
      args_159 = this.matchParens();
    } else {
      args_159 = (0, _immutable.List)();
    }
    return new _terms2.default("NewExpression", { callee: callee_158, arguments: args_159 });
  }
  enforestComputedMemberExpression() {
    let enf_160 = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_160.enforestExpression() });
  }
  transformDestructuring(term_161) {
    switch (term_161.type) {
      case "IdentifierExpression":
        return new _terms2.default("BindingIdentifier", { name: term_161.name });
      case "ParenthesizedExpression":
        if (term_161.inner.size === 1 && this.isIdentifier(term_161.inner.get(0))) {
          return new _terms2.default("BindingIdentifier", { name: term_161.inner.get(0) });
        }
      case "DataProperty":
        return new _terms2.default("BindingPropertyProperty", { name: term_161.name, binding: this.transformDestructuringWithDefault(term_161.expression) });
      case "ShorthandProperty":
        return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_161.name }), init: null });
      case "ObjectExpression":
        return new _terms2.default("ObjectBinding", { properties: term_161.properties.map(t_162 => this.transformDestructuring(t_162)) });
      case "ArrayExpression":
        let last = term_161.elements.last();
        if (last != null && last.type === "SpreadElement") {
          return new _terms2.default("ArrayBinding", { elements: term_161.elements.slice(0, -1).map(t_163 => t_163 && this.transformDestructuringWithDefault(t_163)), restElement: this.transformDestructuringWithDefault(last.expression) });
        } else {
          return new _terms2.default("ArrayBinding", { elements: term_161.elements.map(t_164 => t_164 && this.transformDestructuringWithDefault(t_164)), restElement: null });
        }
        return new _terms2.default("ArrayBinding", { elements: term_161.elements.map(t_165 => t_165 && this.transformDestructuring(t_165)), restElement: null });
      case "StaticPropertyName":
        return new _terms2.default("BindingIdentifier", { name: term_161.value });
      case "ComputedMemberExpression":
      case "StaticMemberExpression":
      case "ArrayBinding":
      case "BindingIdentifier":
      case "BindingPropertyIdentifier":
      case "BindingPropertyProperty":
      case "BindingWithDefault":
      case "ObjectBinding":
        return term_161;
    }
    (0, _errors.assert)(false, "not implemented yet for " + term_161.type);
  }
  transformDestructuringWithDefault(term_166) {
    switch (term_166.type) {
      case "AssignmentExpression":
        return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_166.binding), init: term_166.expression });
    }
    return this.transformDestructuring(term_166);
  }
  enforestArrowExpression() {
    let enf_167;
    if (this.isIdentifier(this.peek())) {
      enf_167 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf_167 = new Enforester(p, (0, _immutable.List)(), this.context);
    }
    let params_168 = enf_167.enforestFormalParameters();
    this.matchPunctuator("=>");
    let body_169;
    if (this.isBraces(this.peek())) {
      body_169 = this.matchCurlies();
    } else {
      enf_167 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      body_169 = enf_167.enforestExpressionLoop();
      this.rest = enf_167.rest;
    }
    return new _terms2.default("ArrowExpression", { params: params_168, body: body_169 });
  }
  enforestYieldExpression() {
    let kwd_170 = this.matchKeyword("yield");
    let lookahead_171 = this.peek();
    if (this.rest.size === 0 || lookahead_171 && !this.lineNumberEq(kwd_170, lookahead_171)) {
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
    let name_172 = this.advance();
    return new _terms2.default("SyntaxQuote", { name: name_172, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_172 }), elements: this.enforestTemplateElements() }) });
  }
  enforestStaticMemberExpression() {
    let object_173 = this.term;
    let dot_174 = this.advance();
    let property_175 = this.advance();
    return new _terms2.default("StaticMemberExpression", { object: object_173, property: property_175 });
  }
  enforestArrayExpression() {
    let arr_176 = this.advance();
    let elements_177 = [];
    let enf_178 = new Enforester(arr_176.inner(), (0, _immutable.List)(), this.context);
    while (enf_178.rest.size > 0) {
      let lookahead = enf_178.peek();
      if (enf_178.isPunctuator(lookahead, ",")) {
        enf_178.advance();
        elements_177.push(null);
      } else if (enf_178.isPunctuator(lookahead, "...")) {
        enf_178.advance();
        let expression = enf_178.enforestExpressionLoop();
        if (expression == null) {
          throw enf_178.createError(lookahead, "expecting expression");
        }
        elements_177.push(new _terms2.default("SpreadElement", { expression: expression }));
      } else {
        let term = enf_178.enforestExpressionLoop();
        if (term == null) {
          throw enf_178.createError(lookahead, "expected expression");
        }
        elements_177.push(term);
        enf_178.consumeComma();
      }
    }
    return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_177) });
  }
  enforestObjectExpression() {
    let obj_179 = this.advance();
    let properties_180 = (0, _immutable.List)();
    let enf_181 = new Enforester(obj_179.inner(), (0, _immutable.List)(), this.context);
    let lastProp_182 = null;
    while (enf_181.rest.size > 0) {
      let prop = enf_181.enforestPropertyDefinition();
      enf_181.consumeComma();
      properties_180 = properties_180.concat(prop);
      if (lastProp_182 === prop) {
        throw enf_181.createError(prop, "invalid syntax in object");
      }
      lastProp_182 = prop;
    }
    return new _terms2.default("ObjectExpression", { properties: properties_180 });
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
    let expr_183 = this.enforestExpressionLoop();
    return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_183 });
  }
  enforestMethodDefinition() {
    let lookahead_184 = this.peek();
    let isGenerator_185 = false;
    if (this.isPunctuator(lookahead_184, "*")) {
      isGenerator_185 = true;
      this.advance();
    }
    if (this.isIdentifier(lookahead_184, "get") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Getter", { name: name, body: body }), kind: "method" };
    } else if (this.isIdentifier(lookahead_184, "set") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName3 = this.enforestPropertyName();

      let name = _enforestPropertyName3.name;

      let enf = new Enforester(this.matchParens(), (0, _immutable.List)(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Setter", { name: name, param: param, body: body }), kind: "method" };
    }

    var _enforestPropertyName4 = this.enforestPropertyName();

    let name = _enforestPropertyName4.name;

    if (this.isParens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester(params, (0, _immutable.List)(), this.context);
      let formalParams = enf.enforestFormalParameters();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_185, name: name, params: formalParams, body: body }), kind: "method" };
    }
    return { methodOrKey: name, kind: this.isIdentifier(lookahead_184) || this.isKeyword(lookahead_184) ? "identifier" : "property" };
  }
  enforestPropertyName() {
    let lookahead_186 = this.peek();
    if (this.isStringLiteral(lookahead_186) || this.isNumericLiteral(lookahead_186)) {
      return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
    } else if (this.isBrackets(lookahead_186)) {
      let enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
    }
    let name_187 = this.advance();
    return { name: new _terms2.default("StaticPropertyName", { value: name_187 }), binding: new _terms2.default("BindingIdentifier", { name: name_187 }) };
  }
  enforestFunction(_ref5) {
    let isExpr = _ref5.isExpr;
    let inDefault = _ref5.inDefault;
    let allowGenerator = _ref5.allowGenerator;

    let name_188 = null,
        params_189,
        body_190,
        rest_191;
    let isGenerator_192 = false;
    let fnKeyword_193 = this.advance();
    let lookahead_194 = this.peek();
    let type_195 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
    if (this.isPunctuator(lookahead_194, "*")) {
      isGenerator_192 = true;
      this.advance();
      lookahead_194 = this.peek();
    }
    if (!this.isParens(lookahead_194)) {
      name_188 = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name_188 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_193) });
    }
    params_189 = this.matchParens();
    body_190 = this.matchCurlies();
    let enf_196 = new Enforester(params_189, (0, _immutable.List)(), this.context);
    let formalParams_197 = enf_196.enforestFormalParameters();
    return new _terms2.default(type_195, { name: name_188, isGenerator: isGenerator_192, params: formalParams_197, body: body_190 });
  }
  enforestFunctionExpression() {
    let name_198 = null,
        params_199,
        body_200,
        rest_201;
    let isGenerator_202 = false;
    this.advance();
    let lookahead_203 = this.peek();
    if (this.isPunctuator(lookahead_203, "*")) {
      isGenerator_202 = true;
      this.advance();
      lookahead_203 = this.peek();
    }
    if (!this.isParens(lookahead_203)) {
      name_198 = this.enforestBindingIdentifier();
    }
    params_199 = this.matchParens();
    body_200 = this.matchCurlies();
    let enf_204 = new Enforester(params_199, (0, _immutable.List)(), this.context);
    let formalParams_205 = enf_204.enforestFormalParameters();
    return new _terms2.default("FunctionExpression", { name: name_198, isGenerator: isGenerator_202, params: formalParams_205, body: body_200 });
  }
  enforestFunctionDeclaration() {
    let name_206, params_207, body_208, rest_209;
    let isGenerator_210 = false;
    this.advance();
    let lookahead_211 = this.peek();
    if (this.isPunctuator(lookahead_211, "*")) {
      isGenerator_210 = true;
      this.advance();
    }
    name_206 = this.enforestBindingIdentifier();
    params_207 = this.matchParens();
    body_208 = this.matchCurlies();
    let enf_212 = new Enforester(params_207, (0, _immutable.List)(), this.context);
    let formalParams_213 = enf_212.enforestFormalParameters();
    return new _terms2.default("FunctionDeclaration", { name: name_206, isGenerator: isGenerator_210, params: formalParams_213, body: body_208 });
  }
  enforestFormalParameters() {
    let items_214 = [];
    let rest_215 = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, "...")) {
        this.matchPunctuator("...");
        rest_215 = this.enforestBindingIdentifier();
        break;
      }
      items_214.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_214), rest: rest_215 });
  }
  enforestParam() {
    return this.enforestBindingElement();
  }
  enforestUpdateExpression() {
    let operator_216 = this.matchUnaryOperator();
    return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_216.val(), operand: this.transformDestructuring(this.term) });
  }
  enforestUnaryExpression() {
    let operator_217 = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm_218 => {
      let type_219, term_220, isPrefix_221;
      if (operator_217.val() === "++" || operator_217.val() === "--") {
        type_219 = "UpdateExpression";
        term_220 = this.transformDestructuring(rightTerm_218);
        isPrefix_221 = true;
      } else {
        type_219 = "UnaryExpression";
        isPrefix_221 = undefined;
        term_220 = rightTerm_218;
      }
      return new _terms2.default(type_219, { operator: operator_217.val(), operand: term_220, isPrefix: isPrefix_221 });
    };
    return EXPR_LOOP_OPERATOR_41;
  }
  enforestConditionalExpression() {
    let test_222 = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }
    this.matchPunctuator("?");
    let enf_223 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
    let consequent_224 = enf_223.enforestExpressionLoop();
    enf_223.matchPunctuator(":");
    enf_223 = new Enforester(enf_223.rest, (0, _immutable.List)(), this.context);
    let alternate_225 = enf_223.enforestExpressionLoop();
    this.rest = enf_223.rest;
    return new _terms2.default("ConditionalExpression", { test: test_222, consequent: consequent_224, alternate: alternate_225 });
  }
  enforestBinaryExpression() {
    let leftTerm_226 = this.term;
    let opStx_227 = this.peek();
    let op_228 = opStx_227.val();
    let opPrec_229 = (0, _operators.getOperatorPrec)(op_228);
    let opAssoc_230 = (0, _operators.getOperatorAssoc)(op_228);
    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_229, opAssoc_230)) {
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = opPrec_229;
      this.opCtx.combine = rightTerm_231 => {
        return new _terms2.default("BinaryExpression", { left: leftTerm_226, operator: opStx_227, right: rightTerm_231 });
      };
      this.advance();
      return EXPR_LOOP_OPERATOR_41;
    } else {
      let term = this.opCtx.combine(leftTerm_226);

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
    let lookahead_232 = this.matchTemplate();
    let elements_233 = lookahead_232.token.items.map(it_234 => {
      if (it_234 instanceof _syntax2.default && it_234.isDelimiter()) {
        let enf = new Enforester(it_234.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default("TemplateElement", { rawValue: it_234.slice.text });
    });
    return elements_233;
  }
  expandMacro(enforestType_235) {
    let name_236 = this.advance();
    let syntaxTransform_237 = this.getFromCompiletimeEnvironment(name_236);
    if (syntaxTransform_237 == null || typeof syntaxTransform_237.value !== "function") {
      throw this.createError(name_236, "the macro name was not bound to a value that could be invoked");
    }
    let useSiteScope_238 = (0, _scope.freshScope)("u");
    let introducedScope_239 = (0, _scope.freshScope)("i");
    this.context.useScope = useSiteScope_238;
    let ctx_240 = new _macroContext2.default(this, name_236, this.context, useSiteScope_238, introducedScope_239);
    let result_241 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_237.value.call(null, ctx_240));
    if (!_immutable.List.isList(result_241)) {
      throw this.createError(name_236, "macro must return a list but got: " + result_241);
    }
    result_241 = result_241.map(stx_242 => {
      if (!(stx_242 && typeof stx_242.addScope === "function")) {
        throw this.createError(name_236, "macro must return syntax objects or terms but got: " + stx_242);
      }
      return stx_242.addScope(introducedScope_239, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
    });
    return result_241;
  }
  consumeSemicolon() {
    let lookahead_243 = this.peek();
    if (lookahead_243 && this.isPunctuator(lookahead_243, ";")) {
      this.advance();
    }
  }
  consumeComma() {
    let lookahead_244 = this.peek();
    if (lookahead_244 && this.isPunctuator(lookahead_244, ",")) {
      this.advance();
    }
  }
  isTerm(term_245) {
    return term_245 && term_245 instanceof _terms2.default;
  }
  isEOF(term_246) {
    return term_246 && term_246 instanceof _syntax2.default && term_246.isEOF();
  }
  isIdentifier(term_247) {
    let val_248 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_247 && term_247 instanceof _syntax2.default && term_247.isIdentifier() && (val_248 === null || term_247.val() === val_248);
  }
  isPropertyName(term_249) {
    return this.isIdentifier(term_249) || this.isKeyword(term_249) || this.isNumericLiteral(term_249) || this.isStringLiteral(term_249) || this.isBrackets(term_249);
  }
  isNumericLiteral(term_250) {
    return term_250 && term_250 instanceof _syntax2.default && term_250.isNumericLiteral();
  }
  isStringLiteral(term_251) {
    return term_251 && term_251 instanceof _syntax2.default && term_251.isStringLiteral();
  }
  isTemplate(term_252) {
    return term_252 && term_252 instanceof _syntax2.default && term_252.isTemplate();
  }
  isBooleanLiteral(term_253) {
    return term_253 && term_253 instanceof _syntax2.default && term_253.isBooleanLiteral();
  }
  isNullLiteral(term_254) {
    return term_254 && term_254 instanceof _syntax2.default && term_254.isNullLiteral();
  }
  isRegularExpression(term_255) {
    return term_255 && term_255 instanceof _syntax2.default && term_255.isRegularExpression();
  }
  isParens(term_256) {
    return term_256 && term_256 instanceof _syntax2.default && term_256.isParens();
  }
  isBraces(term_257) {
    return term_257 && term_257 instanceof _syntax2.default && term_257.isBraces();
  }
  isBrackets(term_258) {
    return term_258 && term_258 instanceof _syntax2.default && term_258.isBrackets();
  }
  isAssign(term_259) {
    if (this.isPunctuator(term_259)) {
      switch (term_259.val()) {
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
  isKeyword(term_260) {
    let val_261 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_260 && term_260 instanceof _syntax2.default && term_260.isKeyword() && (val_261 === null || term_260.val() === val_261);
  }
  isPunctuator(term_262) {
    let val_263 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return term_262 && term_262 instanceof _syntax2.default && term_262.isPunctuator() && (val_263 === null || term_262.val() === val_263);
  }
  isOperator(term_264) {
    return term_264 && term_264 instanceof _syntax2.default && (0, _operators.isOperator)(term_264);
  }
  isUpdateOperator(term_265) {
    return term_265 && term_265 instanceof _syntax2.default && term_265.isPunctuator() && (term_265.val() === "++" || term_265.val() === "--");
  }
  isFnDeclTransform(term_266) {
    return term_266 && term_266 instanceof _syntax2.default && this.context.env.get(term_266.resolve(this.context.phase)) === _transforms.FunctionDeclTransform;
  }
  isVarDeclTransform(term_267) {
    return term_267 && term_267 instanceof _syntax2.default && this.context.env.get(term_267.resolve(this.context.phase)) === _transforms.VariableDeclTransform;
  }
  isLetDeclTransform(term_268) {
    return term_268 && term_268 instanceof _syntax2.default && this.context.env.get(term_268.resolve(this.context.phase)) === _transforms.LetDeclTransform;
  }
  isConstDeclTransform(term_269) {
    return term_269 && term_269 instanceof _syntax2.default && this.context.env.get(term_269.resolve(this.context.phase)) === _transforms.ConstDeclTransform;
  }
  isSyntaxDeclTransform(term_270) {
    return term_270 && term_270 instanceof _syntax2.default && this.context.env.get(term_270.resolve(this.context.phase)) === _transforms.SyntaxDeclTransform;
  }
  isSyntaxrecDeclTransform(term_271) {
    return term_271 && term_271 instanceof _syntax2.default && this.context.env.get(term_271.resolve(this.context.phase)) === _transforms.SyntaxrecDeclTransform;
  }
  isSyntaxTemplate(term_272) {
    return term_272 && term_272 instanceof _syntax2.default && term_272.isSyntaxTemplate();
  }
  isSyntaxQuoteTransform(term_273) {
    return term_273 && term_273 instanceof _syntax2.default && this.context.env.get(term_273.resolve(this.context.phase)) === _transforms.SyntaxQuoteTransform;
  }
  isReturnStmtTransform(term_274) {
    return term_274 && term_274 instanceof _syntax2.default && this.context.env.get(term_274.resolve(this.context.phase)) === _transforms.ReturnStatementTransform;
  }
  isWhileTransform(term_275) {
    return term_275 && term_275 instanceof _syntax2.default && this.context.env.get(term_275.resolve(this.context.phase)) === _transforms.WhileTransform;
  }
  isForTransform(term_276) {
    return term_276 && term_276 instanceof _syntax2.default && this.context.env.get(term_276.resolve(this.context.phase)) === _transforms.ForTransform;
  }
  isSwitchTransform(term_277) {
    return term_277 && term_277 instanceof _syntax2.default && this.context.env.get(term_277.resolve(this.context.phase)) === _transforms.SwitchTransform;
  }
  isBreakTransform(term_278) {
    return term_278 && term_278 instanceof _syntax2.default && this.context.env.get(term_278.resolve(this.context.phase)) === _transforms.BreakTransform;
  }
  isContinueTransform(term_279) {
    return term_279 && term_279 instanceof _syntax2.default && this.context.env.get(term_279.resolve(this.context.phase)) === _transforms.ContinueTransform;
  }
  isDoTransform(term_280) {
    return term_280 && term_280 instanceof _syntax2.default && this.context.env.get(term_280.resolve(this.context.phase)) === _transforms.DoTransform;
  }
  isDebuggerTransform(term_281) {
    return term_281 && term_281 instanceof _syntax2.default && this.context.env.get(term_281.resolve(this.context.phase)) === _transforms.DebuggerTransform;
  }
  isWithTransform(term_282) {
    return term_282 && term_282 instanceof _syntax2.default && this.context.env.get(term_282.resolve(this.context.phase)) === _transforms.WithTransform;
  }
  isTryTransform(term_283) {
    return term_283 && term_283 instanceof _syntax2.default && this.context.env.get(term_283.resolve(this.context.phase)) === _transforms.TryTransform;
  }
  isThrowTransform(term_284) {
    return term_284 && term_284 instanceof _syntax2.default && this.context.env.get(term_284.resolve(this.context.phase)) === _transforms.ThrowTransform;
  }
  isIfTransform(term_285) {
    return term_285 && term_285 instanceof _syntax2.default && this.context.env.get(term_285.resolve(this.context.phase)) === _transforms.IfTransform;
  }
  isNewTransform(term_286) {
    return term_286 && term_286 instanceof _syntax2.default && this.context.env.get(term_286.resolve(this.context.phase)) === _transforms.NewTransform;
  }
  isCompiletimeTransform(term_287) {
    return term_287 && term_287 instanceof _syntax2.default && (this.context.env.get(term_287.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_287.resolve(this.context.phase)) instanceof _transforms.CompiletimeTransform);
  }
  isVarBindingTransform(term_288) {
    return term_288 && term_288 instanceof _syntax2.default && (this.context.env.get(term_288.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform || this.context.store.get(term_288.resolve(this.context.phase)) instanceof _transforms.VarBindingTransform);
  }
  getFromCompiletimeEnvironment(term_289) {
    if (this.context.env.has(term_289.resolve(this.context.phase))) {
      return this.context.env.get(term_289.resolve(this.context.phase));
    }
    return this.context.store.get(term_289.resolve(this.context.phase));
  }
  lineNumberEq(a_290, b_291) {
    if (!(a_290 && b_291)) {
      return false;
    }
    return a_290.lineNumber() === b_291.lineNumber();
  }
  matchIdentifier(val_292) {
    let lookahead_293 = this.advance();
    if (this.isIdentifier(lookahead_293)) {
      return lookahead_293;
    }
    throw this.createError(lookahead_293, "expecting an identifier");
  }
  matchKeyword(val_294) {
    let lookahead_295 = this.advance();
    if (this.isKeyword(lookahead_295, val_294)) {
      return lookahead_295;
    }
    throw this.createError(lookahead_295, "expecting " + val_294);
  }
  matchLiteral() {
    let lookahead_296 = this.advance();
    if (this.isNumericLiteral(lookahead_296) || this.isStringLiteral(lookahead_296) || this.isBooleanLiteral(lookahead_296) || this.isNullLiteral(lookahead_296) || this.isTemplate(lookahead_296) || this.isRegularExpression(lookahead_296)) {
      return lookahead_296;
    }
    throw this.createError(lookahead_296, "expecting a literal");
  }
  matchStringLiteral() {
    let lookahead_297 = this.advance();
    if (this.isStringLiteral(lookahead_297)) {
      return lookahead_297;
    }
    throw this.createError(lookahead_297, "expecting a string literal");
  }
  matchTemplate() {
    let lookahead_298 = this.advance();
    if (this.isTemplate(lookahead_298)) {
      return lookahead_298;
    }
    throw this.createError(lookahead_298, "expecting a template literal");
  }
  matchParens() {
    let lookahead_299 = this.advance();
    if (this.isParens(lookahead_299)) {
      return lookahead_299.inner();
    }
    throw this.createError(lookahead_299, "expecting parens");
  }
  matchCurlies() {
    let lookahead_300 = this.advance();
    if (this.isBraces(lookahead_300)) {
      return lookahead_300.inner();
    }
    throw this.createError(lookahead_300, "expecting curly braces");
  }
  matchSquares() {
    let lookahead_301 = this.advance();
    if (this.isBrackets(lookahead_301)) {
      return lookahead_301.inner();
    }
    throw this.createError(lookahead_301, "expecting sqaure braces");
  }
  matchUnaryOperator() {
    let lookahead_302 = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead_302)) {
      return lookahead_302;
    }
    throw this.createError(lookahead_302, "expecting a unary operator");
  }
  matchPunctuator(val_303) {
    let lookahead_304 = this.advance();
    if (this.isPunctuator(lookahead_304)) {
      if (typeof val_303 !== "undefined") {
        if (lookahead_304.val() === val_303) {
          return lookahead_304;
        } else {
          throw this.createError(lookahead_304, "expecting a " + val_303 + " punctuator");
        }
      }
      return lookahead_304;
    }
    throw this.createError(lookahead_304, "expecting a punctuator");
  }
  createError(stx_305, message_306) {
    let ctx_307 = "";
    let offending_308 = stx_305;
    if (this.rest.size > 0) {
      ctx_307 = this.rest.slice(0, 20).map(term_309 => {
        if (term_309.isDelimiter()) {
          return term_309.inner();
        }
        return _immutable.List.of(term_309);
      }).flatten().map(s_310 => {
        if (s_310 === offending_308) {
          return "__" + s_310.val() + "__";
        }
        return s_310.val();
      }).join(" ");
    } else {
      ctx_307 = offending_308.toString();
    }
    return new Error(message_306 + "\n" + ctx_307);
  }
}
exports.Enforester = Enforester;