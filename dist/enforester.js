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
    let b_121 = this.matchCurlies();
    let body_122 = [];
    let enf_123 = new Enforester_46(b_121, (0, _immutable.List)(), this.context);
    while (enf_123.rest.size !== 0) {
      let lookahead = enf_123.peek();
      let stmt = enf_123.enforestStatement();
      if (stmt == null) {
        throw enf_123.createError(lookahead, "not a statement");
      }
      body_122.push(stmt);
    }
    return new _terms2.default("Block", { statements: (0, _immutable.List)(body_122) });
  }
  enforestClass(_ref) {
    let isExpr = _ref.isExpr;
    let inDefault = _ref.inDefault;

    let kw_124 = this.advance();
    let name_125 = null,
        supr_126 = null;
    let type_127 = isExpr ? "ClassExpression" : "ClassDeclaration";
    if (this.isIdentifier(this.peek())) {
      name_125 = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name_125 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_124) });
      } else {
        throw this.createError(this.peek(), "unexpected syntax");
      }
    }
    if (this.isKeyword(this.peek(), "extends")) {
      this.advance();
      supr_126 = this.enforestExpressionLoop();
    }
    let elements_128 = [];
    let enf_129 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    while (enf_129.rest.size !== 0) {
      if (enf_129.isPunctuator(enf_129.peek(), ";")) {
        enf_129.advance();
        continue;
      }
      let isStatic = false;

      var _enf_129$enforestMeth = enf_129.enforestMethodDefinition();

      let methodOrKey = _enf_129$enforestMeth.methodOrKey;
      let kind = _enf_129$enforestMeth.kind;

      if (kind === "identifier" && methodOrKey.value.val() === "static") {
        isStatic = true;

        var _enf_129$enforestMeth2 = enf_129.enforestMethodDefinition();

        methodOrKey = _enf_129$enforestMeth2.methodOrKey;
        kind = _enf_129$enforestMeth2.kind;
      }
      if (kind === "method") {
        elements_128.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
      } else {
        throw this.createError(enf_129.peek(), "Only methods are allowed in classes");
      }
    }
    return new _terms2.default(type_127, { name: name_125, super: supr_126, elements: (0, _immutable.List)(elements_128) });
  }
  enforestBindingTarget() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref2.allowPunctuator;

    let lookahead_130 = this.peek();
    if (this.isIdentifier(lookahead_130) || this.isKeyword(lookahead_130) || allowPunctuator && this.isPunctuator(lookahead_130)) {
      return this.enforestBindingIdentifier({ allowPunctuator: allowPunctuator });
    } else if (this.isBrackets(lookahead_130)) {
      return this.enforestArrayBinding();
    } else if (this.isBraces(lookahead_130)) {
      return this.enforestObjectBinding();
    }
    (0, _errors.assert)(false, "not implemented yet");
  }
  enforestObjectBinding() {
    let enf_131 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let properties_132 = [];
    while (enf_131.rest.size !== 0) {
      properties_132.push(enf_131.enforestBindingProperty());
      enf_131.consumeComma();
    }
    return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_132) });
  }
  enforestBindingProperty() {
    let lookahead_133 = this.peek();

    var _enforestPropertyName = this.enforestPropertyName();

    let name = _enforestPropertyName.name;
    let binding = _enforestPropertyName.binding;

    if (this.isIdentifier(lookahead_133) || this.isKeyword(lookahead_133, "let") || this.isKeyword(lookahead_133, "yield")) {
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
    let bracket_134 = this.matchSquares();
    let enf_135 = new Enforester_46(bracket_134, (0, _immutable.List)(), this.context);
    let elements_136 = [],
        restElement_137 = null;
    while (enf_135.rest.size !== 0) {
      let el;
      if (enf_135.isPunctuator(enf_135.peek(), ",")) {
        enf_135.consumeComma();
        el = null;
      } else {
        if (enf_135.isPunctuator(enf_135.peek(), "...")) {
          enf_135.advance();
          restElement_137 = enf_135.enforestBindingTarget();
          break;
        } else {
          el = enf_135.enforestBindingElement();
        }
        enf_135.consumeComma();
      }
      elements_136.push(el);
    }
    return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_136), restElement: restElement_137 });
  }
  enforestBindingElement() {
    let binding_138 = this.enforestBindingTarget();
    if (this.isAssign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding_138 = new _terms2.default("BindingWithDefault", { binding: binding_138, init: init });
    }
    return binding_138;
  }
  enforestBindingIdentifier() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref3.allowPunctuator;

    let name_139;
    if (allowPunctuator && this.isPunctuator(this.peek())) {
      name_139 = this.enforestPunctuator();
    } else {
      name_139 = this.enforestIdentifier();
    }
    return new _terms2.default("BindingIdentifier", { name: name_139 });
  }
  enforestPunctuator() {
    let lookahead_140 = this.peek();
    if (this.isPunctuator(lookahead_140)) {
      return this.advance();
    }
    throw this.createError(lookahead_140, "expecting a punctuator");
  }
  enforestIdentifier() {
    let lookahead_141 = this.peek();
    if (this.isIdentifier(lookahead_141) || this.isKeyword(lookahead_141)) {
      return this.advance();
    }
    throw this.createError(lookahead_141, "expecting an identifier");
  }
  enforestReturnStatement() {
    let kw_142 = this.advance();
    let lookahead_143 = this.peek();
    if (this.rest.size === 0 || lookahead_143 && !this.lineNumberEq(kw_142, lookahead_143)) {
      return new _terms2.default("ReturnStatement", { expression: null });
    }
    let term_144 = null;
    if (!this.isPunctuator(lookahead_143, ";")) {
      term_144 = this.enforestExpression();
      (0, _errors.expect)(term_144 != null, "Expecting an expression to follow return keyword", lookahead_143, this.rest);
    }
    this.consumeSemicolon();
    return new _terms2.default("ReturnStatement", { expression: term_144 });
  }
  enforestVariableDeclaration() {
    let kind_145;
    let lookahead_146 = this.advance();
    let kindSyn_147 = lookahead_146;
    let phase_148 = this.context.phase;
    if (kindSyn_147 && this.context.env.get(kindSyn_147.resolve(phase_148)) === _transforms.VariableDeclTransform) {
      kind_145 = "var";
    } else if (kindSyn_147 && this.context.env.get(kindSyn_147.resolve(phase_148)) === _transforms.LetDeclTransform) {
      kind_145 = "let";
    } else if (kindSyn_147 && this.context.env.get(kindSyn_147.resolve(phase_148)) === _transforms.ConstDeclTransform) {
      kind_145 = "const";
    } else if (kindSyn_147 && this.context.env.get(kindSyn_147.resolve(phase_148)) === _transforms.SyntaxDeclTransform) {
      kind_145 = "syntax";
    } else if (kindSyn_147 && this.context.env.get(kindSyn_147.resolve(phase_148)) === _transforms.SyntaxrecDeclTransform) {
      kind_145 = "syntaxrec";
    }
    let decls_149 = (0, _immutable.List)();
    while (true) {
      let term = this.enforestVariableDeclarator({ isSyntax: kind_145 === "syntax" || kind_145 === "syntaxrec" });
      let lookahead_146 = this.peek();
      decls_149 = decls_149.concat(term);
      if (this.isPunctuator(lookahead_146, ",")) {
        this.advance();
      } else {
        break;
      }
    }
    return new _terms2.default("VariableDeclaration", { kind: kind_145, declarators: decls_149 });
  }
  enforestVariableDeclarator(_ref4) {
    let isSyntax = _ref4.isSyntax;

    let id_150 = this.enforestBindingTarget({ allowPunctuator: isSyntax });
    let lookahead_151 = this.peek();
    let init_152, rest_153;
    if (this.isPunctuator(lookahead_151, "=")) {
      this.advance();
      let enf = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
      init_152 = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init_152 = null;
    }
    return new _terms2.default("VariableDeclarator", { binding: id_150, init: init_152 });
  }
  enforestExpressionStatement() {
    let start_154 = this.rest.get(0);
    let expr_155 = this.enforestExpression();
    if (expr_155 === null) {
      throw this.createError(start_154, "not a valid expression");
    }
    this.consumeSemicolon();
    return new _terms2.default("ExpressionStatement", { expression: expr_155 });
  }
  enforestExpression() {
    let left_156 = this.enforestExpressionLoop();
    let lookahead_157 = this.peek();
    if (this.isPunctuator(lookahead_157, ",")) {
      while (this.rest.size !== 0) {
        if (!this.isPunctuator(this.peek(), ",")) {
          break;
        }
        let operator = this.advance();
        let right = this.enforestExpressionLoop();
        left_156 = new _terms2.default("BinaryExpression", { left: left_156, operator: operator, right: right });
      }
    }
    this.term = null;
    return left_156;
  }
  enforestExpressionLoop() {
    this.term = null;
    this.opCtx = { prec: 0, combine: x_158 => x_158, stack: (0, _immutable.List)() };
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
    let lookahead_159 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_159)) {
      this.expandMacro();
      lookahead_159 = this.peek();
    }
    if (this.term === null && this.isTerm(lookahead_159)) {
      return this.advance();
    }
    if (this.term === null && this.isKeyword(lookahead_159, "yield")) {
      return this.enforestYieldExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_159, "class")) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && (this.isIdentifier(lookahead_159) || this.isParens(lookahead_159)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_159, this.peek(1))) {
      return this.enforestArrowExpression();
    }
    if (this.term === null && this.isSyntaxTemplate(lookahead_159)) {
      return this.enforestSyntaxTemplate();
    }
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead_159)) {
      return this.enforestSyntaxQuote();
    }
    if (this.term === null && this.isParens(lookahead_159)) {
      return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
    }
    if (this.term === null && (this.isKeyword(lookahead_159, "this") || this.isIdentifier(lookahead_159) || this.isKeyword(lookahead_159, "let") || this.isKeyword(lookahead_159, "yield") || this.isNumericLiteral(lookahead_159) || this.isStringLiteral(lookahead_159) || this.isTemplate(lookahead_159) || this.isBooleanLiteral(lookahead_159) || this.isNullLiteral(lookahead_159) || this.isRegularExpression(lookahead_159) || this.isFnDeclTransform(lookahead_159) || this.isBraces(lookahead_159) || this.isBrackets(lookahead_159))) {
      return this.enforestPrimaryExpression();
    }
    if (this.term === null && this.isOperator(lookahead_159)) {
      return this.enforestUnaryExpression();
    }
    if (this.term === null && this.isVarBindingTransform(lookahead_159)) {
      let id = this.getFromCompiletimeEnvironment(lookahead_159).id;
      if (id !== lookahead_159) {
        this.advance();
        this.rest = _immutable.List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION_45;
      }
    }
    if (this.term === null && (this.isNewTransform(lookahead_159) || this.isKeyword(lookahead_159, "super")) || this.term && (this.isPunctuator(lookahead_159, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1))) || this.isBrackets(lookahead_159) || this.isParens(lookahead_159))) {
      return this.enforestLeftHandSideExpression({ allowCall: true });
    }
    if (this.term && this.isTemplate(lookahead_159)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term && this.isUpdateOperator(lookahead_159)) {
      return this.enforestUpdateExpression();
    }
    if (this.term && this.isOperator(lookahead_159)) {
      return this.enforestBinaryExpression();
    }
    if (this.term && this.isAssign(lookahead_159)) {
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
    if (this.term && this.isPunctuator(lookahead_159, "?")) {
      return this.enforestConditionalExpression();
    }
    return EXPR_LOOP_NO_CHANGE_44;
  }
  enforestPrimaryExpression() {
    let lookahead_160 = this.peek();
    if (this.term === null && this.isKeyword(lookahead_160, "this")) {
      return this.enforestThisExpression();
    }
    if (this.term === null && (this.isIdentifier(lookahead_160) || this.isKeyword(lookahead_160, "let") || this.isKeyword(lookahead_160, "yield"))) {
      return this.enforestIdentifierExpression();
    }
    if (this.term === null && this.isNumericLiteral(lookahead_160)) {
      return this.enforestNumericLiteral();
    }
    if (this.term === null && this.isStringLiteral(lookahead_160)) {
      return this.enforestStringLiteral();
    }
    if (this.term === null && this.isTemplate(lookahead_160)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term === null && this.isBooleanLiteral(lookahead_160)) {
      return this.enforestBooleanLiteral();
    }
    if (this.term === null && this.isNullLiteral(lookahead_160)) {
      return this.enforestNullLiteral();
    }
    if (this.term === null && this.isRegularExpression(lookahead_160)) {
      return this.enforestRegularExpressionLiteral();
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_160)) {
      return this.enforestFunctionExpression();
    }
    if (this.term === null && this.isBraces(lookahead_160)) {
      return this.enforestObjectExpression();
    }
    if (this.term === null && this.isBrackets(lookahead_160)) {
      return this.enforestArrayExpression();
    }
    (0, _errors.assert)(false, "Not a primary expression");
  }
  enforestLeftHandSideExpression(_ref5) {
    let allowCall = _ref5.allowCall;

    let lookahead_161 = this.peek();
    if (this.isKeyword(lookahead_161, "super")) {
      this.advance();
      this.term = new _terms2.default("Super", {});
    } else if (this.isNewTransform(lookahead_161)) {
      this.term = this.enforestNewExpression();
    }
    while (true) {
      lookahead_161 = this.peek();
      if (this.isParens(lookahead_161)) {
        if (!allowCall) {
          if (this.term && (0, _terms.isIdentifierExpression)(this.term)) {
            return this.term;
          }
          this.term = this.enforestExpressionLoop();
        } else {
          this.term = this.enforestCallExpression();
        }
      } else if (this.isBrackets(lookahead_161)) {
        this.term = allowCall ? this.enforestComputedMemberExpression() : this.enforestExpressionLoop();
      } else if (this.isPunctuator(lookahead_161, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        this.term = this.enforestStaticMemberExpression();
      } else if (this.isTemplate(lookahead_161)) {
        this.term = this.enforestTemplateLiteral();
      } else if (this.isBraces(lookahead_161)) {
        this.term = this.enforestPrimaryExpression();
      } else if (this.isIdentifier(lookahead_161)) {
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
    let num_162 = this.advance();
    if (num_162.val() === 1 / 0) {
      return new _terms2.default("LiteralInfinityExpression", {});
    }
    return new _terms2.default("LiteralNumericExpression", { value: num_162 });
  }
  enforestIdentifierExpression() {
    return new _terms2.default("IdentifierExpression", { name: this.advance() });
  }
  enforestRegularExpressionLiteral() {
    let reStx_163 = this.advance();
    let lastSlash_164 = reStx_163.token.value.lastIndexOf("/");
    let pattern_165 = reStx_163.token.value.slice(1, lastSlash_164);
    let flags_166 = reStx_163.token.value.slice(lastSlash_164 + 1);
    return new _terms2.default("LiteralRegExpExpression", { pattern: pattern_165, flags: flags_166 });
  }
  enforestNullLiteral() {
    this.advance();
    return new _terms2.default("LiteralNullExpression", {});
  }
  enforestThisExpression() {
    return new _terms2.default("ThisExpression", { stx: this.advance() });
  }
  enforestArgumentList() {
    let result_167 = [];
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
      result_167.push(arg);
    }
    return (0, _immutable.List)(result_167);
  }
  enforestNewExpression() {
    this.matchKeyword("new");
    if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
      this.advance();
      this.advance();
      return new _terms2.default("NewTargetExpression", {});
    }
    let callee_168 = this.enforestLeftHandSideExpression({ allowCall: false });
    let args_169;
    if (this.isParens(this.peek())) {
      args_169 = this.matchParens();
    } else {
      args_169 = (0, _immutable.List)();
    }
    return new _terms2.default("NewExpression", { callee: callee_168, arguments: args_169 });
  }
  enforestComputedMemberExpression() {
    let enf_170 = new Enforester_46(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_170.enforestExpression() });
  }
  transformDestructuring(term_171) {
    switch (term_171.type) {
      case "IdentifierExpression":
        return new _terms2.default("BindingIdentifier", { name: term_171.name });
      case "ParenthesizedExpression":
        if (term_171.inner.size === 1 && this.isIdentifier(term_171.inner.get(0))) {
          return new _terms2.default("BindingIdentifier", { name: term_171.inner.get(0) });
        }
      case "DataProperty":
        return new _terms2.default("BindingPropertyProperty", { name: term_171.name, binding: this.transformDestructuringWithDefault(term_171.expression) });
      case "ShorthandProperty":
        return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_171.name }), init: null });
      case "ObjectExpression":
        return new _terms2.default("ObjectBinding", { properties: term_171.properties.map(t_172 => this.transformDestructuring(t_172)) });
      case "ArrayExpression":
        let last = term_171.elements.last();
        if (last != null && last.type === "SpreadElement") {
          return new _terms2.default("ArrayBinding", { elements: term_171.elements.slice(0, -1).map(t_173 => t_173 && this.transformDestructuringWithDefault(t_173)), restElement: this.transformDestructuringWithDefault(last.expression) });
        } else {
          return new _terms2.default("ArrayBinding", { elements: term_171.elements.map(t_174 => t_174 && this.transformDestructuringWithDefault(t_174)), restElement: null });
        }
        return new _terms2.default("ArrayBinding", { elements: term_171.elements.map(t_175 => t_175 && this.transformDestructuring(t_175)), restElement: null });
      case "StaticPropertyName":
        return new _terms2.default("BindingIdentifier", { name: term_171.value });
      case "ComputedMemberExpression":
      case "StaticMemberExpression":
      case "ArrayBinding":
      case "BindingIdentifier":
      case "BindingPropertyIdentifier":
      case "BindingPropertyProperty":
      case "BindingWithDefault":
      case "ObjectBinding":
        return term_171;
    }
    (0, _errors.assert)(false, "not implemented yet for " + term_171.type);
  }
  transformDestructuringWithDefault(term_176) {
    switch (term_176.type) {
      case "AssignmentExpression":
        return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_176.binding), init: term_176.expression });
    }
    return this.transformDestructuring(term_176);
  }
  enforestCallExpression() {
    let paren_177 = this.advance();
    return new _terms2.default("CallExpression", { callee: this.term, arguments: paren_177.inner() });
  }
  enforestArrowExpression() {
    let enf_178;
    if (this.isIdentifier(this.peek())) {
      enf_178 = new Enforester_46(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf_178 = new Enforester_46(p, (0, _immutable.List)(), this.context);
    }
    let params_179 = enf_178.enforestFormalParameters();
    this.matchPunctuator("=>");
    let body_180;
    if (this.isBraces(this.peek())) {
      body_180 = this.matchCurlies();
    } else {
      enf_178 = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
      body_180 = enf_178.enforestExpressionLoop();
      this.rest = enf_178.rest;
    }
    return new _terms2.default("ArrowExpression", { params: params_179, body: body_180 });
  }
  enforestYieldExpression() {
    let kwd_181 = this.matchKeyword("yield");
    let lookahead_182 = this.peek();
    if (this.rest.size === 0 || lookahead_182 && !this.lineNumberEq(kwd_181, lookahead_182)) {
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
    let name_183 = this.advance();
    return new _terms2.default("SyntaxQuote", { name: name_183, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_183 }), elements: this.enforestTemplateElements() }) });
  }
  enforestStaticMemberExpression() {
    let object_184 = this.term;
    let dot_185 = this.advance();
    let property_186 = this.advance();
    return new _terms2.default("StaticMemberExpression", { object: object_184, property: property_186 });
  }
  enforestArrayExpression() {
    let arr_187 = this.advance();
    let elements_188 = [];
    let enf_189 = new Enforester_46(arr_187.inner(), (0, _immutable.List)(), this.context);
    while (enf_189.rest.size > 0) {
      let lookahead = enf_189.peek();
      if (enf_189.isPunctuator(lookahead, ",")) {
        enf_189.advance();
        elements_188.push(null);
      } else if (enf_189.isPunctuator(lookahead, "...")) {
        enf_189.advance();
        let expression = enf_189.enforestExpressionLoop();
        if (expression == null) {
          throw enf_189.createError(lookahead, "expecting expression");
        }
        elements_188.push(new _terms2.default("SpreadElement", { expression: expression }));
      } else {
        let term = enf_189.enforestExpressionLoop();
        if (term == null) {
          throw enf_189.createError(lookahead, "expected expression");
        }
        elements_188.push(term);
        enf_189.consumeComma();
      }
    }
    return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_188) });
  }
  enforestObjectExpression() {
    let obj_190 = this.advance();
    let properties_191 = (0, _immutable.List)();
    let enf_192 = new Enforester_46(obj_190.inner(), (0, _immutable.List)(), this.context);
    let lastProp_193 = null;
    while (enf_192.rest.size > 0) {
      let prop = enf_192.enforestPropertyDefinition();
      enf_192.consumeComma();
      properties_191 = properties_191.concat(prop);
      if (lastProp_193 === prop) {
        throw enf_192.createError(prop, "invalid syntax in object");
      }
      lastProp_193 = prop;
    }
    return new _terms2.default("ObjectExpression", { properties: properties_191 });
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
    let expr_194 = this.enforestExpressionLoop();
    return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_194 });
  }
  enforestMethodDefinition() {
    let lookahead_195 = this.peek();
    let isGenerator_196 = false;
    if (this.isPunctuator(lookahead_195, "*")) {
      isGenerator_196 = true;
      this.advance();
    }
    if (this.isIdentifier(lookahead_195, "get") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Getter", { name: name, body: body }), kind: "method" };
    } else if (this.isIdentifier(lookahead_195, "set") && this.isPropertyName(this.peek(1))) {
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
      return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_196, name: name, params: formalParams, body: body }), kind: "method" };
    }
    return { methodOrKey: name, kind: this.isIdentifier(lookahead_195) || this.isKeyword(lookahead_195) ? "identifier" : "property" };
  }
  enforestPropertyName() {
    let lookahead_197 = this.peek();
    if (this.isStringLiteral(lookahead_197) || this.isNumericLiteral(lookahead_197)) {
      return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
    } else if (this.isBrackets(lookahead_197)) {
      let enf = new Enforester_46(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
    }
    let name_198 = this.advance();
    return { name: new _terms2.default("StaticPropertyName", { value: name_198 }), binding: new _terms2.default("BindingIdentifier", { name: name_198 }) };
  }
  enforestFunction(_ref6) {
    let isExpr = _ref6.isExpr;
    let inDefault = _ref6.inDefault;
    let allowGenerator = _ref6.allowGenerator;

    let name_199 = null,
        params_200,
        body_201,
        rest_202;
    let isGenerator_203 = false;
    let fnKeyword_204 = this.advance();
    let lookahead_205 = this.peek();
    let type_206 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
    if (this.isPunctuator(lookahead_205, "*")) {
      isGenerator_203 = true;
      this.advance();
      lookahead_205 = this.peek();
    }
    if (!this.isParens(lookahead_205)) {
      name_199 = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name_199 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_204) });
    }
    params_200 = this.matchParens();
    body_201 = this.matchCurlies();
    let enf_207 = new Enforester_46(params_200, (0, _immutable.List)(), this.context);
    let formalParams_208 = enf_207.enforestFormalParameters();
    return new _terms2.default(type_206, { name: name_199, isGenerator: isGenerator_203, params: formalParams_208, body: body_201 });
  }
  enforestFunctionExpression() {
    let name_209 = null,
        params_210,
        body_211,
        rest_212;
    let isGenerator_213 = false;
    this.advance();
    let lookahead_214 = this.peek();
    if (this.isPunctuator(lookahead_214, "*")) {
      isGenerator_213 = true;
      this.advance();
      lookahead_214 = this.peek();
    }
    if (!this.isParens(lookahead_214)) {
      name_209 = this.enforestBindingIdentifier();
    }
    params_210 = this.matchParens();
    body_211 = this.matchCurlies();
    let enf_215 = new Enforester_46(params_210, (0, _immutable.List)(), this.context);
    let formalParams_216 = enf_215.enforestFormalParameters();
    return new _terms2.default("FunctionExpression", { name: name_209, isGenerator: isGenerator_213, params: formalParams_216, body: body_211 });
  }
  enforestFunctionDeclaration() {
    let name_217, params_218, body_219, rest_220;
    let isGenerator_221 = false;
    this.advance();
    let lookahead_222 = this.peek();
    if (this.isPunctuator(lookahead_222, "*")) {
      isGenerator_221 = true;
      this.advance();
    }
    name_217 = this.enforestBindingIdentifier();
    params_218 = this.matchParens();
    body_219 = this.matchCurlies();
    let enf_223 = new Enforester_46(params_218, (0, _immutable.List)(), this.context);
    let formalParams_224 = enf_223.enforestFormalParameters();
    return new _terms2.default("FunctionDeclaration", { name: name_217, isGenerator: isGenerator_221, params: formalParams_224, body: body_219 });
  }
  enforestFormalParameters() {
    let items_225 = [];
    let rest_226 = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, "...")) {
        this.matchPunctuator("...");
        rest_226 = this.enforestBindingIdentifier();
        break;
      }
      items_225.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_225), rest: rest_226 });
  }
  enforestParam() {
    return this.enforestBindingElement();
  }
  enforestUpdateExpression() {
    let operator_227 = this.matchUnaryOperator();
    return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_227.val(), operand: this.transformDestructuring(this.term) });
  }
  enforestUnaryExpression() {
    let operator_228 = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm_229 => {
      let type_230, term_231, isPrefix_232;
      if (operator_228.val() === "++" || operator_228.val() === "--") {
        type_230 = "UpdateExpression";
        term_231 = this.transformDestructuring(rightTerm_229);
        isPrefix_232 = true;
      } else {
        type_230 = "UnaryExpression";
        isPrefix_232 = undefined;
        term_231 = rightTerm_229;
      }
      return new _terms2.default(type_230, { operator: operator_228.val(), operand: term_231, isPrefix: isPrefix_232 });
    };
    return EXPR_LOOP_OPERATOR_43;
  }
  enforestConditionalExpression() {
    let test_233 = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }
    this.matchPunctuator("?");
    let enf_234 = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
    let consequent_235 = enf_234.enforestExpressionLoop();
    enf_234.matchPunctuator(":");
    enf_234 = new Enforester_46(enf_234.rest, (0, _immutable.List)(), this.context);
    let alternate_236 = enf_234.enforestExpressionLoop();
    this.rest = enf_234.rest;
    return new _terms2.default("ConditionalExpression", { test: test_233, consequent: consequent_235, alternate: alternate_236 });
  }
  enforestBinaryExpression() {
    let leftTerm_237 = this.term;
    let opStx_238 = this.peek();
    let op_239 = opStx_238.val();
    let opPrec_240 = (0, _operators.getOperatorPrec)(op_239);
    let opAssoc_241 = (0, _operators.getOperatorAssoc)(op_239);
    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_240, opAssoc_241)) {
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = opPrec_240;
      this.opCtx.combine = rightTerm_242 => {
        return new _terms2.default("BinaryExpression", { left: leftTerm_237, operator: opStx_238, right: rightTerm_242 });
      };
      this.advance();
      return EXPR_LOOP_OPERATOR_43;
    } else {
      let term = this.opCtx.combine(leftTerm_237);

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
    let lookahead_243 = this.matchTemplate();
    let elements_244 = lookahead_243.token.items.map(it_245 => {
      if (this.isDelimiter(it_245)) {
        let enf = new Enforester_46(it_245.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default("TemplateElement", { rawValue: it_245.slice.text });
    });
    return elements_244;
  }
  expandMacro() {
    let lookahead_246 = this.peek();
    while (this.isCompiletimeTransform(lookahead_246)) {
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
      result = result.map(stx_247 => {
        if (!(stx_247 && typeof stx_247.addScope === "function")) {
          throw this.createError(name, "macro must return syntax objects or terms but got: " + stx_247);
        }
        return stx_247.addScope(introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
      });
      this.rest = result.concat(ctx._rest(this));
      lookahead_246 = this.peek();
    }
  }
  consumeSemicolon() {
    let lookahead_248 = this.peek();
    if (lookahead_248 && this.isPunctuator(lookahead_248, ";")) {
      this.advance();
    }
  }
  consumeComma() {
    let lookahead_249 = this.peek();
    if (lookahead_249 && this.isPunctuator(lookahead_249, ",")) {
      this.advance();
    }
  }
  safeCheck(obj_250, type_251) {
    let val_252 = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return obj_250 && (typeof obj_250.match === "function" ? obj_250.match(type_251, val_252) : false);
  }
  isTerm(term_253) {
    return term_253 && term_253 instanceof _terms2.default;
  }
  isEOF(obj_254) {
    return this.safeCheck(obj_254, "eof");
  }
  isIdentifier(obj_255) {
    let val_256 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_255, "identifier", val_256);
  }
  isPropertyName(obj_257) {
    return this.isIdentifier(obj_257) || this.isKeyword(obj_257) || this.isNumericLiteral(obj_257) || this.isStringLiteral(obj_257) || this.isBrackets(obj_257);
  }
  isNumericLiteral(obj_258) {
    let val_259 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_258, "number", val_259);
  }
  isStringLiteral(obj_260) {
    let val_261 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_260, "string", val_261);
  }
  isTemplate(obj_262) {
    let val_263 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_262, "template", val_263);
  }
  isSyntaxTemplate(obj_264) {
    return this.safeCheck(obj_264, "syntaxTemplate");
  }
  isBooleanLiteral(obj_265) {
    let val_266 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_265, "boolean", val_266);
  }
  isNullLiteral(obj_267) {
    let val_268 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_267, "null", val_268);
  }
  isRegularExpression(obj_269) {
    let val_270 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_269, "regularExpression", val_270);
  }
  isDelimiter(obj_271) {
    return this.safeCheck(obj_271, "delimiter");
  }
  isParens(obj_272) {
    return this.safeCheck(obj_272, "parens");
  }
  isBraces(obj_273) {
    return this.safeCheck(obj_273, "braces");
  }
  isBrackets(obj_274) {
    return this.safeCheck(obj_274, "brackets");
  }
  isAssign(obj_275) {
    let val_276 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_275, "assign", val_276);
  }
  isKeyword(obj_277) {
    let val_278 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_277, "keyword", val_278);
  }
  isPunctuator(obj_279) {
    let val_280 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_279, "punctuator", val_280);
  }
  isOperator(obj_281) {
    return (this.safeCheck(obj_281, "punctuator") || this.safeCheck(obj_281, "identifier") || this.safeCheck(obj_281, "keyword")) && (0, _operators.isOperator)(obj_281);
  }
  isUpdateOperator(obj_282) {
    return this.safeCheck(obj_282, "punctuator", "++") || this.safeCheck(obj_282, "punctuator", "--");
  }
  safeResolve(obj_283, phase_284) {
    return obj_283 && typeof obj_283.resolve === "function" ? Just_41(obj_283.resolve(phase_284)) : Nothing_42();
  }
  isTransform(obj_285, trans_286) {
    return this.safeResolve(obj_285, this.context.phase).map(name_287 => this.context.env.get(name_287) === trans_286 || this.context.store.get(name_287) === trans_286).getOrElse(false);
  }
  isTransformInstance(obj_288, trans_289) {
    return this.safeResolve(obj_288, this.context.phase).map(name_290 => this.context.env.get(name_290) instanceof trans_289 || this.context.store.get(name_290) instanceof trans_289).getOrElse(false);
  }
  isFnDeclTransform(obj_291) {
    return this.isTransform(obj_291, _transforms.FunctionDeclTransform);
  }
  isVarDeclTransform(obj_292) {
    return this.isTransform(obj_292, _transforms.VariableDeclTransform);
  }
  isLetDeclTransform(obj_293) {
    return this.isTransform(obj_293, _transforms.LetDeclTransform);
  }
  isConstDeclTransform(obj_294) {
    return this.isTransform(obj_294, _transforms.ConstDeclTransform);
  }
  isSyntaxDeclTransform(obj_295) {
    return this.isTransform(obj_295, _transforms.SyntaxDeclTransform);
  }
  isSyntaxrecDeclTransform(obj_296) {
    return this.isTransform(obj_296, _transforms.SyntaxrecDeclTransform);
  }
  isSyntaxQuoteTransform(obj_297) {
    return this.isTransform(obj_297, _transforms.SyntaxQuoteTransform);
  }
  isReturnStmtTransform(obj_298) {
    return this.isTransform(obj_298, _transforms.ReturnStatementTransform);
  }
  isWhileTransform(obj_299) {
    return this.isTransform(obj_299, _transforms.WhileTransform);
  }
  isForTransform(obj_300) {
    return this.isTransform(obj_300, _transforms.ForTransform);
  }
  isSwitchTransform(obj_301) {
    return this.isTransform(obj_301, _transforms.SwitchTransform);
  }
  isBreakTransform(obj_302) {
    return this.isTransform(obj_302, _transforms.BreakTransform);
  }
  isContinueTransform(obj_303) {
    return this.isTransform(obj_303, _transforms.ContinueTransform);
  }
  isDoTransform(obj_304) {
    return this.isTransform(obj_304, _transforms.DoTransform);
  }
  isDebuggerTransform(obj_305) {
    return this.isTransform(obj_305, _transforms.DebuggerTransform);
  }
  isWithTransform(obj_306) {
    return this.isTransform(obj_306, _transforms.WithTransform);
  }
  isTryTransform(obj_307) {
    return this.isTransform(obj_307, _transforms.TryTransform);
  }
  isThrowTransform(obj_308) {
    return this.isTransform(obj_308, _transforms.ThrowTransform);
  }
  isIfTransform(obj_309) {
    return this.isTransform(obj_309, _transforms.IfTransform);
  }
  isNewTransform(obj_310) {
    return this.isTransform(obj_310, _transforms.NewTransform);
  }
  isCompiletimeTransform(obj_311) {
    return this.isTransformInstance(obj_311, _transforms.CompiletimeTransform);
  }
  isVarBindingTransform(obj_312) {
    return this.isTransformInstance(obj_312, _transforms.VarBindingTransform);
  }
  getFromCompiletimeEnvironment(term_313) {
    if (this.context.env.has(term_313.resolve(this.context.phase))) {
      return this.context.env.get(term_313.resolve(this.context.phase));
    }
    return this.context.store.get(term_313.resolve(this.context.phase));
  }
  lineNumberEq(a_314, b_315) {
    if (!(a_314 && b_315)) {
      return false;
    }
    return a_314.lineNumber() === b_315.lineNumber();
  }
  matchIdentifier(val_316) {
    let lookahead_317 = this.advance();
    if (this.isIdentifier(lookahead_317)) {
      return lookahead_317;
    }
    throw this.createError(lookahead_317, "expecting an identifier");
  }
  matchKeyword(val_318) {
    let lookahead_319 = this.advance();
    if (this.isKeyword(lookahead_319, val_318)) {
      return lookahead_319;
    }
    throw this.createError(lookahead_319, "expecting " + val_318);
  }
  matchLiteral() {
    let lookahead_320 = this.advance();
    if (this.isNumericLiteral(lookahead_320) || this.isStringLiteral(lookahead_320) || this.isBooleanLiteral(lookahead_320) || this.isNullLiteral(lookahead_320) || this.isTemplate(lookahead_320) || this.isRegularExpression(lookahead_320)) {
      return lookahead_320;
    }
    throw this.createError(lookahead_320, "expecting a literal");
  }
  matchStringLiteral() {
    let lookahead_321 = this.advance();
    if (this.isStringLiteral(lookahead_321)) {
      return lookahead_321;
    }
    throw this.createError(lookahead_321, "expecting a string literal");
  }
  matchTemplate() {
    let lookahead_322 = this.advance();
    if (this.isTemplate(lookahead_322)) {
      return lookahead_322;
    }
    throw this.createError(lookahead_322, "expecting a template literal");
  }
  matchParens() {
    let lookahead_323 = this.advance();
    if (this.isParens(lookahead_323)) {
      return lookahead_323.inner();
    }
    throw this.createError(lookahead_323, "expecting parens");
  }
  matchCurlies() {
    let lookahead_324 = this.advance();
    if (this.isBraces(lookahead_324)) {
      return lookahead_324.inner();
    }
    throw this.createError(lookahead_324, "expecting curly braces");
  }
  matchSquares() {
    let lookahead_325 = this.advance();
    if (this.isBrackets(lookahead_325)) {
      return lookahead_325.inner();
    }
    throw this.createError(lookahead_325, "expecting sqaure braces");
  }
  matchUnaryOperator() {
    let lookahead_326 = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead_326)) {
      return lookahead_326;
    }
    throw this.createError(lookahead_326, "expecting a unary operator");
  }
  matchPunctuator(val_327) {
    let lookahead_328 = this.advance();
    if (this.isPunctuator(lookahead_328)) {
      if (typeof val_327 !== "undefined") {
        if (lookahead_328.val() === val_327) {
          return lookahead_328;
        } else {
          throw this.createError(lookahead_328, "expecting a " + val_327 + " punctuator");
        }
      }
      return lookahead_328;
    }
    throw this.createError(lookahead_328, "expecting a punctuator");
  }
  createError(stx_329, message_330) {
    let ctx_331 = "";
    let offending_332 = stx_329;
    if (this.rest.size > 0) {
      ctx_331 = this.rest.slice(0, 20).map(term_333 => {
        if (term_333.isDelimiter()) {
          return term_333.inner();
        }
        return _immutable.List.of(term_333);
      }).flatten().map(s_334 => {
        if (s_334 === offending_332) {
          return "__" + s_334.val() + "__";
        }
        return s_334.val();
      }).join(" ");
    } else {
      ctx_331 = offending_332.toString();
    }
    return new Error(message_330 + "\n" + ctx_331);
  }
}
exports.Enforester = Enforester_46;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2VuZm9yZXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBQ0EsTUFBTSxVQUFVLG9CQUFNLElBQXRCO0FBQ0EsTUFBTSxhQUFhLG9CQUFNLE9BQXpCO0FBQ0EsTUFBTSx3QkFBd0IsRUFBOUI7QUFDQSxNQUFNLHlCQUF5QixFQUEvQjtBQUNBLE1BQU0seUJBQXlCLEVBQS9CO0FBQ0EsTUFBTSxhQUFOLENBQW9CO0FBQ2xCLGNBQVksT0FBWixFQUFxQixPQUFyQixFQUE4QixVQUE5QixFQUEwQztBQUN4QyxTQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0Esd0JBQU8sZ0JBQUssTUFBTCxDQUFZLE9BQVosQ0FBUCxFQUE2Qix1Q0FBN0I7QUFDQSx3QkFBTyxnQkFBSyxNQUFMLENBQVksT0FBWixDQUFQLEVBQTZCLHVDQUE3QjtBQUNBLHdCQUFPLFVBQVAsRUFBbUIsaUNBQW5CO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLE9BQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxPQUFaO0FBQ0EsU0FBSyxPQUFMLEdBQWUsVUFBZjtBQUNEO0FBQ0QsU0FBZTtBQUFBLFFBQVYsSUFBVSx5REFBSCxDQUFHOztBQUNiLFdBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLElBQWQsQ0FBUDtBQUNEO0FBQ0QsWUFBVTtBQUNSLFFBQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWI7QUFDQSxTQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQVo7QUFDQSxXQUFPLE1BQVA7QUFDRDtBQUNELGFBQTZCO0FBQUEsUUFBcEIsT0FBb0IseURBQVYsUUFBVTs7QUFDM0IsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFFBQUksS0FBSyxJQUFMLENBQVUsSUFBVixLQUFt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RUFBbkIsRUFBdUIsR0FBdkIsQ0FBMkIsWUFBWTtBQUMvQyxZQUFJLFNBQVMsV0FBVCxFQUFKLEVBQTRCO0FBQzFCLGlCQUFPLFNBQVMsS0FBVCxFQUFQO0FBQ0Q7QUFDRCxlQUFPLGdCQUFLLEVBQUwsQ0FBUSxRQUFSLENBQVA7QUFDRCxPQUxTLEVBS1AsT0FMTyxHQUtHLEdBTEgsQ0FLTyxTQUFTO0FBQ3hCLFlBQUksVUFBVSxhQUFkLEVBQTZCO0FBQzNCLGlCQUFPLE9BQU8sTUFBTSxHQUFOLEVBQVAsR0FBcUIsSUFBNUI7QUFDRDtBQUNELGVBQU8sTUFBTSxHQUFOLEVBQVA7QUFDRCxPQVZTLEVBVVAsSUFWTyxDQVVGLEdBVkUsQ0FBVjtBQVdELEtBWkQsTUFZTztBQUNMLGdCQUFVLGNBQWMsUUFBZCxFQUFWO0FBQ0Q7QUFDRCxXQUFPLElBQUksS0FBSixDQUFVLGNBQWMsSUFBZCxHQUFxQixPQUEvQixDQUFQO0FBQ0Q7QUFsa0RpQjtRQW9rREssVSxHQUFqQixhIiwiZmlsZSI6ImVuZm9yZXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSwge2lzSWRlbnRpZmllckV4cHJlc3Npb259IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuaW1wb3J0IHtGdW5jdGlvbkRlY2xUcmFuc2Zvcm0sIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSwgTmV3VHJhbnNmb3JtLCBMZXREZWNsVHJhbnNmb3JtLCBDb25zdERlY2xUcmFuc2Zvcm0sIFN5bnRheERlY2xUcmFuc2Zvcm0sIFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0sIFN5bnRheFF1b3RlVHJhbnNmb3JtLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0sIFdoaWxlVHJhbnNmb3JtLCBJZlRyYW5zZm9ybSwgRm9yVHJhbnNmb3JtLCBTd2l0Y2hUcmFuc2Zvcm0sIEJyZWFrVHJhbnNmb3JtLCBDb250aW51ZVRyYW5zZm9ybSwgRG9UcmFuc2Zvcm0sIERlYnVnZ2VyVHJhbnNmb3JtLCBXaXRoVHJhbnNmb3JtLCBUcnlUcmFuc2Zvcm0sIFRocm93VHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybSwgVmFyQmluZGluZ1RyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7aXNPcGVyYXRvciwgaXNVbmFyeU9wZXJhdG9yLCBnZXRPcGVyYXRvckFzc29jLCBnZXRPcGVyYXRvclByZWMsIG9wZXJhdG9yTHR9IGZyb20gXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFN5bnRheCwge0FMTF9QSEFTRVN9IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHtmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IHtzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzfSBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IE1hY3JvQ29udGV4dCBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5jb25zdCBKdXN0XzQxID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNDIgPSBNYXliZS5Ob3RoaW5nO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzQzID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQ0ID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzQ1ID0ge307XG5jbGFzcyBFbmZvcmVzdGVyXzQ2IHtcbiAgY29uc3RydWN0b3Ioc3R4bF80NywgcHJldl80OCwgY29udGV4dF80OSkge1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChzdHhsXzQ3KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChwcmV2XzQ4KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChjb250ZXh0XzQ5LCBcImV4cGVjdGluZyBhIGNvbnRleHQgdG8gZW5mb3Jlc3RcIik7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLnJlc3QgPSBzdHhsXzQ3O1xuICAgIHRoaXMucHJldiA9IHByZXZfNDg7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF80OTtcbiAgfVxuICBwZWVrKG5fNTAgPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdC5nZXQobl81MCk7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBsZXQgcmV0XzUxID0gdGhpcy5yZXN0LmZpcnN0KCk7XG4gICAgdGhpcy5yZXN0ID0gdGhpcy5yZXN0LnJlc3QoKTtcbiAgICByZXR1cm4gcmV0XzUxO1xuICB9XG4gIGVuZm9yZXN0KHR5cGVfNTIgPSBcIk1vZHVsZVwiKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdF81MztcbiAgICBpZiAodHlwZV81MiA9PT0gXCJleHByZXNzaW9uXCIpIHtcbiAgICAgIHJlc3VsdF81MyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRfNTMgPSB0aGlzLmVuZm9yZXN0TW9kdWxlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF81MztcbiAgfVxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdEJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RNb2R1bGVJdGVtKCk7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGVJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfNTQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU0LCBcImltcG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTQsIFwiZXhwb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81NCwgXCIjXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdExhbmd1YWdlUHJhZ21hKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYW5ndWFnZVByYWdtYSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcIiNcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJsYW5nXCIpO1xuICAgIGxldCBwYXRoXzU1ID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJQcmFnbWFcIiwge2tpbmQ6IFwibGFuZ1wiLCBpdGVtczogTGlzdC5vZihwYXRoXzU1KX0pO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF81NiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTYsIFwiKlwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF81NikpIHtcbiAgICAgIGxldCBuYW1lZEV4cG9ydHMgPSB0aGlzLmVuZm9yZXN0RXhwb3J0Q2xhdXNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJmcm9tXCIpKSB7XG4gICAgICAgIG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRGcm9tXCIsIHtuYW1lZEV4cG9ydHM6IG5hbWVkRXhwb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NiwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU2KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NiwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKHRoaXMucGVlaygpKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNsYXNzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiBib2R5fSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTYpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NikgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTYpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NikgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU2KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF81NiwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydENsYXVzZSgpIHtcbiAgICBsZXQgZW5mXzU3ID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfNTggPSBbXTtcbiAgICB3aGlsZSAoZW5mXzU3LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzU4LnB1c2goZW5mXzU3LmVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkpO1xuICAgICAgZW5mXzU3LmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNTgpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkge1xuICAgIGxldCBuYW1lXzU5ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGV4cG9ydGVkTmFtZSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNTksIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgZXhwb3J0ZWROYW1lOiBuYW1lXzU5fSk7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzYwID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGRlZmF1bHRCaW5kaW5nXzYxID0gbnVsbDtcbiAgICBsZXQgbmFtZWRJbXBvcnRzXzYyID0gTGlzdCgpO1xuICAgIGxldCBmb3JTeW50YXhfNjMgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzYwKSkge1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ182MSwgbmFtZWRJbXBvcnRzOiBuYW1lZEltcG9ydHNfNjIsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNjApIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF82MCkpIHtcbiAgICAgIGRlZmF1bHRCaW5kaW5nXzYxID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGZvclN5bnRheF82MyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNjEsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyLCBuYW1lZEltcG9ydHM6IExpc3QoKSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjN9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICBsb29rYWhlYWRfNjAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNjApKSB7XG4gICAgICBsZXQgaW1wb3J0cyA9IHRoaXMuZW5mb3Jlc3ROYW1lZEltcG9ydHMoKTtcbiAgICAgIGxldCBmcm9tQ2xhdXNlID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF82MyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ182MSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjMsIG5hbWVkSW1wb3J0czogaW1wb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBmcm9tQ2xhdXNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNjAsIFwiKlwiKSkge1xuICAgICAgbGV0IG5hbWVzcGFjZUJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNjMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNjEsIGZvclN5bnRheDogZm9yU3ludGF4XzYzLCBuYW1lc3BhY2VCaW5kaW5nOiBuYW1lc3BhY2VCaW5kaW5nLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF82MCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIqXCIpO1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICB9XG4gIGVuZm9yZXN0TmFtZWRJbXBvcnRzKCkge1xuICAgIGxldCBlbmZfNjQgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF82NSA9IFtdO1xuICAgIHdoaWxlIChlbmZfNjQucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfNjUucHVzaChlbmZfNjQuZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkpO1xuICAgICAgZW5mXzY0LmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNjUpO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzY2ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG5hbWVfNjc7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82NikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY2KSkge1xuICAgICAgbmFtZV82NyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNjd9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNjYsIFwidW5leHBlY3RlZCB0b2tlbiBpbiBpbXBvcnQgc3BlY2lmaWVyXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNjcsIGJpbmRpbmc6IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGcm9tQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiZnJvbVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzY4ID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbG9va2FoZWFkXzY4O1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF82OSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF82OSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbih7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY5LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50KCkge1xuICAgIGxldCBsb29rYWhlYWRfNzAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICBsb29rYWhlYWRfNzAgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJsb2NrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWZUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZlN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGb3JUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3dpdGNoVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyZWFrVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29udGludWVUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEb1RyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERvU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RlYnVnZ2VyVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2l0aFRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVHJ5VHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VHJ5U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rocm93VHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzAsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF83MCkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIjpcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNzApIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF83MCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNzApIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF83MCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF83MCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkVtcHR5U3RhdGVtZW50XCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCkge1xuICAgIGxldCBsYWJlbF83MSA9IHRoaXMubWF0Y2hJZGVudGlmaWVyKCk7XG4gICAgbGV0IHB1bmNfNzIgPSB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IHN0bXRfNzMgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzcxLCBib2R5OiBzdG10XzczfSk7XG4gIH1cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImJyZWFrXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNzQgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzUgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNzQsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzc1fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNzQpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83NCwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzQsIFwibGV0XCIpKSB7XG4gICAgICBsYWJlbF83NSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzV9KTtcbiAgfVxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRyeVwiKTtcbiAgICBsZXQgYm9keV83NiA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXRjaFwiKSkge1xuICAgICAgbGV0IGNhdGNoQ2xhdXNlID0gdGhpcy5lbmZvcmVzdENhdGNoQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzc2LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2UsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogYm9keV83NiwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNzYsIGNhdGNoQ2xhdXNlOiBudWxsLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInRyeSB3aXRoIG5vIGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gIH1cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhdGNoXCIpO1xuICAgIGxldCBiaW5kaW5nUGFyZW5zXzc3ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNzggPSBuZXcgRW5mb3Jlc3Rlcl80NihiaW5kaW5nUGFyZW5zXzc3LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGJpbmRpbmdfNzkgPSBlbmZfNzguZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGJvZHlfODAgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogYmluZGluZ183OSwgYm9keTogYm9keV84MH0pO1xuICB9XG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0aHJvd1wiKTtcbiAgICBsZXQgZXhwcmVzc2lvbl84MSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb25fODF9KTtcbiAgfVxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aXRoXCIpO1xuICAgIGxldCBvYmpQYXJlbnNfODIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MyA9IG5ldyBFbmZvcmVzdGVyXzQ2KG9ialBhcmVuc184MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBvYmplY3RfODQgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfODUgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7b2JqZWN0OiBvYmplY3RfODQsIGJvZHk6IGJvZHlfODV9KTtcbiAgfVxuICBlbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVidWdnZXJcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGVidWdnZXJTdGF0ZW1lbnRcIiwge30pO1xuICB9XG4gIGVuZm9yZXN0RG9TdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkb1wiKTtcbiAgICBsZXQgYm9keV84NiA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCB0ZXN0Qm9keV84NyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzg4ID0gbmV3IEVuZm9yZXN0ZXJfNDYodGVzdEJvZHlfODcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdF84OSA9IGVuZl84OC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzg2LCB0ZXN0OiB0ZXN0Xzg5fSk7XG4gIH1cbiAgZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dkXzkwID0gdGhpcy5tYXRjaEtleXdvcmQoXCJjb250aW51ZVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzkxID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzkyID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzkxLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF85Mn0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkXzkwLCBsb29rYWhlYWRfOTEpICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfOTEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF85MSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfOTEsIFwibGV0XCIpKSkge1xuICAgICAgbGFiZWxfOTIgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzkyfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJzd2l0Y2hcIik7XG4gICAgbGV0IGNvbmRfOTMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85NCA9IG5ldyBFbmZvcmVzdGVyXzQ2KGNvbmRfOTMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZGlzY3JpbWluYW50Xzk1ID0gZW5mXzk0LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5Xzk2ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBpZiAoYm9keV85Ni5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzk1LCBjYXNlczogTGlzdCgpfSk7XG4gICAgfVxuICAgIGVuZl85NCA9IG5ldyBFbmZvcmVzdGVyXzQ2KGJvZHlfOTYsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY2FzZXNfOTcgPSBlbmZfOTQuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgIGxldCBsb29rYWhlYWRfOTggPSBlbmZfOTQucGVlaygpO1xuICAgIGlmIChlbmZfOTQuaXNLZXl3b3JkKGxvb2thaGVhZF85OCwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmZfOTQuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZl85NC5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfOTUsIHByZURlZmF1bHRDYXNlczogY2FzZXNfOTcsIGRlZmF1bHRDYXNlOiBkZWZhdWx0Q2FzZSwgcG9zdERlZmF1bHRDYXNlczogcG9zdERlZmF1bHRDYXNlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzk1LCBjYXNlczogY2FzZXNfOTd9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VzKCkge1xuICAgIGxldCBjYXNlc185OSA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikpKSB7XG4gICAgICBjYXNlc185OS5wdXNoKHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChjYXNlc185OSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2FzZVwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpLCBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCkge1xuICAgIGxldCByZXN1bHRfMTAwID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXNlXCIpKSkge1xuICAgICAgcmVzdWx0XzEwMC5wdXNoKHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzEwMCk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVmYXVsdFwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9yU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZm9yXCIpO1xuICAgIGxldCBjb25kXzEwMSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzEwMiA9IG5ldyBFbmZvcmVzdGVyXzQ2KGNvbmRfMTAxLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMDMsIHRlc3RfMTA0LCBpbml0XzEwNSwgcmlnaHRfMTA2LCB0eXBlXzEwNywgbGVmdF8xMDgsIHVwZGF0ZV8xMDk7XG4gICAgaWYgKGVuZl8xMDIuaXNQdW5jdHVhdG9yKGVuZl8xMDIucGVlaygpLCBcIjtcIikpIHtcbiAgICAgIGVuZl8xMDIuYWR2YW5jZSgpO1xuICAgICAgaWYgKCFlbmZfMTAyLmlzUHVuY3R1YXRvcihlbmZfMTAyLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIHRlc3RfMTA0ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIGVuZl8xMDIubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgIGlmIChlbmZfMTAyLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICByaWdodF8xMDYgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBudWxsLCB0ZXN0OiB0ZXN0XzEwNCwgdXBkYXRlOiByaWdodF8xMDYsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb29rYWhlYWRfMTAzID0gZW5mXzEwMi5wZWVrKCk7XG4gICAgICBpZiAoZW5mXzEwMi5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEwMykgfHwgZW5mXzEwMi5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEwMykgfHwgZW5mXzEwMi5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTAzKSkge1xuICAgICAgICBpbml0XzEwNSA9IGVuZl8xMDIuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgIGxvb2thaGVhZF8xMDMgPSBlbmZfMTAyLnBlZWsoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMDMsIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEwMywgXCJvZlwiKSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTAzLCBcImluXCIpKSB7XG4gICAgICAgICAgICBlbmZfMTAyLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0XzEwNiA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzEwNyA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMDMsIFwib2ZcIikpIHtcbiAgICAgICAgICAgIGVuZl8xMDIuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfMTA2ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIHR5cGVfMTA3ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDcsIHtsZWZ0OiBpbml0XzEwNSwgcmlnaHQ6IHJpZ2h0XzEwNiwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzEwMi5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzEwMi5pc1B1bmN0dWF0b3IoZW5mXzEwMi5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl8xMDIuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfMTA0ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0XzEwNCA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzEwMi5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV8xMDkgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGVuZl8xMDIucGVlaygxKSwgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihlbmZfMTAyLnBlZWsoMSksIFwib2ZcIikpIHtcbiAgICAgICAgICBsZWZ0XzEwOCA9IGVuZl8xMDIuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICAgIGxldCBraW5kID0gZW5mXzEwMi5hZHZhbmNlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGtpbmQsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIHR5cGVfMTA3ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eXBlXzEwNyA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmlnaHRfMTA2ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDcsIHtsZWZ0OiBsZWZ0XzEwOCwgcmlnaHQ6IHJpZ2h0XzEwNiwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5pdF8xMDUgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICBlbmZfMTAyLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfMTAyLmlzUHVuY3R1YXRvcihlbmZfMTAyLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzEwMi5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF8xMDQgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3RfMTA0ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfMTAyLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlXzEwOSA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IGluaXRfMTA1LCB0ZXN0OiB0ZXN0XzEwNCwgdXBkYXRlOiB1cGRhdGVfMTA5LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RJZlN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImlmXCIpO1xuICAgIGxldCBjb25kXzExMCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzExMSA9IG5ldyBFbmZvcmVzdGVyXzQ2KGNvbmRfMTEwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMTIgPSBlbmZfMTExLnBlZWsoKTtcbiAgICBsZXQgdGVzdF8xMTMgPSBlbmZfMTExLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ZXN0XzExMyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzExMS5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTEyLCBcImV4cGVjdGluZyBhbiBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBsZXQgY29uc2VxdWVudF8xMTQgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgbGV0IGFsdGVybmF0ZV8xMTUgPSBudWxsO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJlbHNlXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGFsdGVybmF0ZV8xMTUgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0ZXN0XzExMywgY29uc2VxdWVudDogY29uc2VxdWVudF8xMTQsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzExNX0pO1xuICB9XG4gIGVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aGlsZVwiKTtcbiAgICBsZXQgY29uZF8xMTYgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl8xMTcgPSBuZXcgRW5mb3Jlc3Rlcl80Nihjb25kXzExNiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTE4ID0gZW5mXzExNy5wZWVrKCk7XG4gICAgbGV0IHRlc3RfMTE5ID0gZW5mXzExNy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF8xMTkgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl8xMTcuY3JlYXRlRXJyb3IobG9va2FoZWFkXzExOCwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGJvZHlfMTIwID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIldoaWxlU3RhdGVtZW50XCIsIHt0ZXN0OiB0ZXN0XzExOSwgYm9keTogYm9keV8xMjB9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrU3RhdGVtZW50KCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5lbmZvcmVzdEJsb2NrKCl9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrKCkge1xuICAgIGxldCBiXzEyMSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGJvZHlfMTIyID0gW107XG4gICAgbGV0IGVuZl8xMjMgPSBuZXcgRW5mb3Jlc3Rlcl80NihiXzEyMSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTIzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xMjMucGVlaygpO1xuICAgICAgbGV0IHN0bXQgPSBlbmZfMTIzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICBpZiAoc3RtdCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IGVuZl8xMjMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcIm5vdCBhIHN0YXRlbWVudFwiKTtcbiAgICAgIH1cbiAgICAgIGJvZHlfMTIyLnB1c2goc3RtdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiBMaXN0KGJvZHlfMTIyKX0pO1xuICB9XG4gIGVuZm9yZXN0Q2xhc3Moe2lzRXhwciwgaW5EZWZhdWx0fSkge1xuICAgIGxldCBrd18xMjQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbmFtZV8xMjUgPSBudWxsLCBzdXByXzEyNiA9IG51bGw7XG4gICAgbGV0IHR5cGVfMTI3ID0gaXNFeHByID8gXCJDbGFzc0V4cHJlc3Npb25cIiA6IFwiQ2xhc3NEZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIG5hbWVfMTI1ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICghaXNFeHByKSB7XG4gICAgICBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICAgIG5hbWVfMTI1ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiX2RlZmF1bHRcIiwga3dfMTI0KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcih0aGlzLnBlZWsoKSwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImV4dGVuZHNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgc3Vwcl8xMjYgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9XG4gICAgbGV0IGVsZW1lbnRzXzEyOCA9IFtdO1xuICAgIGxldCBlbmZfMTI5ID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTI5LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgaWYgKGVuZl8xMjkuaXNQdW5jdHVhdG9yKGVuZl8xMjkucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgZW5mXzEyOS5hZHZhbmNlKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IGlzU3RhdGljID0gZmFsc2U7XG4gICAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMjkuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG4gICAgICBpZiAoa2luZCA9PT0gXCJpZGVudGlmaWVyXCIgJiYgbWV0aG9kT3JLZXkudmFsdWUudmFsKCkgPT09IFwic3RhdGljXCIpIHtcbiAgICAgICAgaXNTdGF0aWMgPSB0cnVlO1xuICAgICAgICAoe21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMjkuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkpO1xuICAgICAgfVxuICAgICAgaWYgKGtpbmQgPT09IFwibWV0aG9kXCIpIHtcbiAgICAgICAgZWxlbWVudHNfMTI4LnB1c2gobmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiBpc1N0YXRpYywgbWV0aG9kOiBtZXRob2RPcktleX0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IoZW5mXzEyOS5wZWVrKCksIFwiT25seSBtZXRob2RzIGFyZSBhbGxvd2VkIGluIGNsYXNzZXNcIik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEyNywge25hbWU6IG5hbWVfMTI1LCBzdXBlcjogc3Vwcl8xMjYsIGVsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEyOCl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcn0gPSB7fSkge1xuICAgIGxldCBsb29rYWhlYWRfMTMwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzApIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzApIHx8IGFsbG93UHVuY3R1YXRvciAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTMwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7YWxsb3dQdW5jdHVhdG9yOiBhbGxvd1B1bmN0dWF0b3J9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTMwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUJpbmRpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzEzMCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0QmluZGluZygpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldFwiKTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEJpbmRpbmcoKSB7XG4gICAgbGV0IGVuZl8xMzEgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTMyID0gW107XG4gICAgd2hpbGUgKGVuZl8xMzEucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBwcm9wZXJ0aWVzXzEzMi5wdXNoKGVuZl8xMzEuZW5mb3Jlc3RCaW5kaW5nUHJvcGVydHkoKSk7XG4gICAgICBlbmZfMTMxLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiBMaXN0KHByb3BlcnRpZXNfMTMyKX0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkge1xuICAgIGxldCBsb29rYWhlYWRfMTMzID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHtuYW1lLCBiaW5kaW5nfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEzMykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJ5aWVsZFwiKSkge1xuICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCI6XCIpKSB7XG4gICAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGV4cHI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogYmluZGluZywgaW5pdDogZGVmYXVsdFZhbHVlfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBiaW5kaW5nID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IG5hbWUsIGJpbmRpbmc6IGJpbmRpbmd9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5QmluZGluZygpIHtcbiAgICBsZXQgYnJhY2tldF8xMzQgPSB0aGlzLm1hdGNoU3F1YXJlcygpO1xuICAgIGxldCBlbmZfMTM1ID0gbmV3IEVuZm9yZXN0ZXJfNDYoYnJhY2tldF8xMzQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZWxlbWVudHNfMTM2ID0gW10sIHJlc3RFbGVtZW50XzEzNyA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xMzUucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgZWw7XG4gICAgICBpZiAoZW5mXzEzNS5pc1B1bmN0dWF0b3IoZW5mXzEzNS5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTM1LmNvbnN1bWVDb21tYSgpO1xuICAgICAgICBlbCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZW5mXzEzNS5pc1B1bmN0dWF0b3IoZW5mXzEzNS5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgICAgZW5mXzEzNS5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdEVsZW1lbnRfMTM3ID0gZW5mXzEzNS5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbCA9IGVuZl8xMzUuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGVuZl8xMzUuY29uc3VtZUNvbW1hKCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50c18xMzYucHVzaChlbCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTM2KSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50XzEzN30pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKSB7XG4gICAgbGV0IGJpbmRpbmdfMTM4ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIGJpbmRpbmdfMTM4ID0gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IGJpbmRpbmdfMTM4LCBpbml0OiBpbml0fSk7XG4gICAgfVxuICAgIHJldHVybiBiaW5kaW5nXzEzODtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKHthbGxvd1B1bmN0dWF0b3J9ID0ge30pIHtcbiAgICBsZXQgbmFtZV8xMzk7XG4gICAgaWYgKGFsbG93UHVuY3R1YXRvciAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIG5hbWVfMTM5ID0gdGhpcy5lbmZvcmVzdFB1bmN0dWF0b3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZV8xMzkgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV8xMzl9KTtcbiAgfVxuICBlbmZvcmVzdFB1bmN0dWF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNDAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE0MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTQwLCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgZW5mb3Jlc3RJZGVudGlmaWVyKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTQxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNDEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNDEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzE0MSwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBlbmZvcmVzdFJldHVyblN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dfMTQyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xNDMgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE0MyAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dfMTQyLCBsb29rYWhlYWRfMTQzKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBudWxsfSk7XG4gICAgfVxuICAgIGxldCB0ZXJtXzE0NCA9IG51bGw7XG4gICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTQzLCBcIjtcIikpIHtcbiAgICAgIHRlcm1fMTQ0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIGV4cGVjdCh0ZXJtXzE0NCAhPSBudWxsLCBcIkV4cGVjdGluZyBhbiBleHByZXNzaW9uIHRvIGZvbGxvdyByZXR1cm4ga2V5d29yZFwiLCBsb29rYWhlYWRfMTQzLCB0aGlzLnJlc3QpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRlcm1fMTQ0fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCkge1xuICAgIGxldCBraW5kXzE0NTtcbiAgICBsZXQgbG9va2FoZWFkXzE0NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBraW5kU3luXzE0NyA9IGxvb2thaGVhZF8xNDY7XG4gICAgbGV0IHBoYXNlXzE0OCA9IHRoaXMuY29udGV4dC5waGFzZTtcbiAgICBpZiAoa2luZFN5bl8xNDcgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDcucmVzb2x2ZShwaGFzZV8xNDgpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzE0NSA9IFwidmFyXCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzE0NyAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzE0Ny5yZXNvbHZlKHBoYXNlXzE0OCkpID09PSBMZXREZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzE0NSA9IFwibGV0XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzE0NyAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzE0Ny5yZXNvbHZlKHBoYXNlXzE0OCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQ1ID0gXCJjb25zdFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDcgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDcucmVzb2x2ZShwaGFzZV8xNDgpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDUgPSBcInN5bnRheFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDcgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDcucmVzb2x2ZShwaGFzZV8xNDgpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDUgPSBcInN5bnRheHJlY1wiO1xuICAgIH1cbiAgICBsZXQgZGVjbHNfMTQ5ID0gTGlzdCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4OiBraW5kXzE0NSA9PT0gXCJzeW50YXhcIiB8fCBraW5kXzE0NSA9PT0gXCJzeW50YXhyZWNcIn0pO1xuICAgICAgbGV0IGxvb2thaGVhZF8xNDYgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGRlY2xzXzE0OSA9IGRlY2xzXzE0OS5jb25jYXQodGVybSk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE0NiwgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IGtpbmRfMTQ1LCBkZWNsYXJhdG9yczogZGVjbHNfMTQ5fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4fSkge1xuICAgIGxldCBpZF8xNTAgPSB0aGlzLmVuZm9yZXN0QmluZGluZ1RhcmdldCh7YWxsb3dQdW5jdHVhdG9yOiBpc1N5bnRheH0pO1xuICAgIGxldCBsb29rYWhlYWRfMTUxID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGluaXRfMTUyLCByZXN0XzE1MztcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1MSwgXCI9XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGluaXRfMTUyID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbml0XzE1MiA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogaWRfMTUwLCBpbml0OiBpbml0XzE1Mn0pO1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvblN0YXRlbWVudCgpIHtcbiAgICBsZXQgc3RhcnRfMTU0ID0gdGhpcy5yZXN0LmdldCgwKTtcbiAgICBsZXQgZXhwcl8xNTUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmIChleHByXzE1NSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihzdGFydF8xNTQsIFwibm90IGEgdmFsaWQgZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xNTV9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRfMTU2ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xNTcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NywgXCIsXCIpKSB7XG4gICAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wZXJhdG9yID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGxldCByaWdodCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBsZWZ0XzE1NiA9IG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xNTYsIG9wZXJhdG9yOiBvcGVyYXRvciwgcmlnaHQ6IHJpZ2h0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgcmV0dXJuIGxlZnRfMTU2O1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLm9wQ3R4ID0ge3ByZWM6IDAsIGNvbWJpbmU6IHhfMTU4ID0+IHhfMTU4LCBzdGFjazogTGlzdCgpfTtcbiAgICBkbyB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpO1xuICAgICAgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfNDQgJiYgdGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRV80NCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX09QRVJBVE9SXzQzIHx8IHRlcm0gPT09IEVYUFJfTE9PUF9FWFBBTlNJT05fNDUpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRlcm07XG4gICAgICB9XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXMudGVybTtcbiAgfVxuICBlbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTU5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzE1OSkpIHtcbiAgICAgIHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIGxvb2thaGVhZF8xNTkgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTksIFwieWllbGRcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OSwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiB0cnVlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTkpIHx8IHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE1OSkpICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgXCI9PlwiKSAmJiB0aGlzLmxpbmVOdW1iZXJFcShsb29rYWhlYWRfMTU5LCB0aGlzLnBlZWsoMSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhUZW1wbGF0ZShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhRdW90ZVRyYW5zZm9ybShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhRdW90ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE1OSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIsIHtpbm5lcjogdGhpcy5hZHZhbmNlKCkuaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU5LCBcInRoaXNcIikgfHwgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OSwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xNTkpIHx8IHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTU5KSB8fCB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8xNTkpIHx8IHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTU5KSB8fCB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzE1OSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xNTkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNWYXJCaW5kaW5nVHJhbnNmb3JtKGxvb2thaGVhZF8xNTkpKSB7XG4gICAgICBsZXQgaWQgPSB0aGlzLmdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KGxvb2thaGVhZF8xNTkpLmlkO1xuICAgICAgaWYgKGlkICE9PSBsb29rYWhlYWRfMTU5KSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLnJlc3QgPSBMaXN0Lm9mKGlkKS5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgICAgcmV0dXJuIEVYUFJfTE9PUF9FWFBBTlNJT05fNDU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1OSwgXCJzdXBlclwiKSkgfHwgdGhpcy50ZXJtICYmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTU5LCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkgfHwgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNTkpIHx8IHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE1OSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oe2FsbG93Q2FsbDogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTU5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUxpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVXBkYXRlT3BlcmF0b3IobG9va2FoZWFkXzE1OSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTU5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc0Fzc2lnbihsb29rYWhlYWRfMTU5KSkge1xuICAgICAgbGV0IGJpbmRpbmcgPSB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGhpcy50ZXJtKTtcbiAgICAgIGxldCBvcCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGluaXQgPSBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mLnJlc3Q7XG4gICAgICBpZiAob3AudmFsKCkgPT09IFwiPVwiKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBvcGVyYXRvcjogb3AudmFsKCksIGV4cHJlc3Npb246IGluaXR9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTU5LCBcIj9cIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQ0O1xuICB9XG4gIGVuZm9yZXN0UHJpbWFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNjAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNjAsIFwidGhpc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaGlzRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTYwKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTYwLCBcImxldFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTYwLCBcInlpZWxkXCIpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTYwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3ROdW1lcmljTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xNjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0cmluZ0xpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzE2MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8xNjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvb2xlYW5MaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8xNjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE51bGxMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8xNjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJlZ3VsYXJFeHByZXNzaW9uTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzE2MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTYwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwiTm90IGEgcHJpbWFyeSBleHByZXNzaW9uXCIpO1xuICB9XG4gIGVuZm9yZXN0TGVmdEhhbmRTaWRlRXhwcmVzc2lvbih7YWxsb3dDYWxsfSkge1xuICAgIGxldCBsb29rYWhlYWRfMTYxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNjEsIFwic3VwZXJcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy50ZXJtID0gbmV3IFRlcm0oXCJTdXBlclwiLCB7fSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xNjEpKSB7XG4gICAgICB0aGlzLnRlcm0gPSB0aGlzLmVuZm9yZXN0TmV3RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbG9va2FoZWFkXzE2MSA9IHRoaXMucGVlaygpO1xuICAgICAgaWYgKHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE2MSkpIHtcbiAgICAgICAgaWYgKCFhbGxvd0NhbGwpIHtcbiAgICAgICAgICBpZiAodGhpcy50ZXJtICYmIGlzSWRlbnRpZmllckV4cHJlc3Npb24odGhpcy50ZXJtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdENhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNjEpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IGFsbG93Q2FsbCA/IHRoaXMuZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKSA6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTYxLCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xNjEpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUxpdGVyYWwoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTYxKSkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLmVuZm9yZXN0UHJpbWFyeUV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2MSkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RCb29sZWFuTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0aGlzLnRlcm0sIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdHJpbmdMaXRlcmFsKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdE51bWVyaWNMaXRlcmFsKCkge1xuICAgIGxldCBudW1fMTYyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKG51bV8xNjIudmFsKCkgPT09IDEgLyAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbnVtXzE2Mn0pO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllckV4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RSZWd1bGFyRXhwcmVzc2lvbkxpdGVyYWwoKSB7XG4gICAgbGV0IHJlU3R4XzE2MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsYXN0U2xhc2hfMTY0ID0gcmVTdHhfMTYzLnRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICBsZXQgcGF0dGVybl8xNjUgPSByZVN0eF8xNjMudG9rZW4udmFsdWUuc2xpY2UoMSwgbGFzdFNsYXNoXzE2NCk7XG4gICAgbGV0IGZsYWdzXzE2NiA9IHJlU3R4XzE2My50b2tlbi52YWx1ZS5zbGljZShsYXN0U2xhc2hfMTY0ICsgMSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiwge3BhdHRlcm46IHBhdHRlcm5fMTY1LCBmbGFnczogZmxhZ3NfMTY2fSk7XG4gIH1cbiAgZW5mb3Jlc3ROdWxsTGl0ZXJhbCgpIHtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVsbEV4cHJlc3Npb25cIiwge30pO1xuICB9XG4gIGVuZm9yZXN0VGhpc0V4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhpc0V4cHJlc3Npb25cIiwge3N0eDogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdEFyZ3VtZW50TGlzdCgpIHtcbiAgICBsZXQgcmVzdWx0XzE2NyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBhcmcgPSBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIsXCIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0XzE2Ny5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xNjcpO1xuICB9XG4gIGVuZm9yZXN0TmV3RXhwcmVzc2lvbigpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIm5ld1wiKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLlwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwidGFyZ2V0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3VGFyZ2V0RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfVxuICAgIGxldCBjYWxsZWVfMTY4ID0gdGhpcy5lbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oe2FsbG93Q2FsbDogZmFsc2V9KTtcbiAgICBsZXQgYXJnc18xNjk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnModGhpcy5wZWVrKCkpKSB7XG4gICAgICBhcmdzXzE2OSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJnc18xNjkgPSBMaXN0KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzE2OCwgYXJndW1lbnRzOiBhcmdzXzE2OX0pO1xuICB9XG4gIGVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBlbmZfMTcwID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaFNxdWFyZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLnRlcm0sIGV4cHJlc3Npb246IGVuZl8xNzAuZW5mb3Jlc3RFeHByZXNzaW9uKCl9KTtcbiAgfVxuICB0cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTcxKSB7XG4gICAgc3dpdGNoICh0ZXJtXzE3MS50eXBlKSB7XG4gICAgICBjYXNlIFwiSWRlbnRpZmllckV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTcxLm5hbWV9KTtcbiAgICAgIGNhc2UgXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiOlxuICAgICAgICBpZiAodGVybV8xNzEuaW5uZXIuc2l6ZSA9PT0gMSAmJiB0aGlzLmlzSWRlbnRpZmllcih0ZXJtXzE3MS5pbm5lci5nZXQoMCkpKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTcxLmlubmVyLmdldCgwKX0pO1xuICAgICAgICB9XG4gICAgICBjYXNlIFwiRGF0YVByb3BlcnR5XCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0ZXJtXzE3MS5uYW1lLCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtXzE3MS5leHByZXNzaW9uKX0pO1xuICAgICAgY2FzZSBcIlNob3J0aGFuZFByb3BlcnR5XCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTcxLm5hbWV9KSwgaW5pdDogbnVsbH0pO1xuICAgICAgY2FzZSBcIk9iamVjdEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV8xNzEucHJvcGVydGllcy5tYXAodF8xNzIgPT4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRfMTcyKSl9KTtcbiAgICAgIGNhc2UgXCJBcnJheUV4cHJlc3Npb25cIjpcbiAgICAgICAgbGV0IGxhc3QgPSB0ZXJtXzE3MS5lbGVtZW50cy5sYXN0KCk7XG4gICAgICAgIGlmIChsYXN0ICE9IG51bGwgJiYgbGFzdC50eXBlID09PSBcIlNwcmVhZEVsZW1lbnRcIikge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTcxLmVsZW1lbnRzLnNsaWNlKDAsIC0xKS5tYXAodF8xNzMgPT4gdF8xNzMgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodF8xNzMpKSwgcmVzdEVsZW1lbnQ6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KGxhc3QuZXhwcmVzc2lvbil9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE3MS5lbGVtZW50cy5tYXAodF8xNzQgPT4gdF8xNzQgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodF8xNzQpKSwgcmVzdEVsZW1lbnQ6IG51bGx9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE3MS5lbGVtZW50cy5tYXAodF8xNzUgPT4gdF8xNzUgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRfMTc1KSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICBjYXNlIFwiU3RhdGljUHJvcGVydHlOYW1lXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE3MS52YWx1ZX0pO1xuICAgICAgY2FzZSBcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJBcnJheUJpbmRpbmdcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nSWRlbnRpZmllclwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdXaXRoRGVmYXVsdFwiOlxuICAgICAgY2FzZSBcIk9iamVjdEJpbmRpbmdcIjpcbiAgICAgICAgcmV0dXJuIHRlcm1fMTcxO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3IgXCIgKyB0ZXJtXzE3MS50eXBlKTtcbiAgfVxuICB0cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNzYpIHtcbiAgICBzd2l0Y2ggKHRlcm1fMTc2LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE3Ni5iaW5kaW5nKSwgaW5pdDogdGVybV8xNzYuZXhwcmVzc2lvbn0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTc2KTtcbiAgfVxuICBlbmZvcmVzdENhbGxFeHByZXNzaW9uKCkge1xuICAgIGxldCBwYXJlbl8xNzcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiB0aGlzLnRlcm0sIGFyZ3VtZW50czogcGFyZW5fMTc3LmlubmVyKCl9KTtcbiAgfVxuICBlbmZvcmVzdEFycm93RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE3ODtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBlbmZfMTc4ID0gbmV3IEVuZm9yZXN0ZXJfNDYoTGlzdC5vZih0aGlzLmFkdmFuY2UoKSksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBlbmZfMTc4ID0gbmV3IEVuZm9yZXN0ZXJfNDYocCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH1cbiAgICBsZXQgcGFyYW1zXzE3OSA9IGVuZl8xNzguZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI9PlwiKTtcbiAgICBsZXQgYm9keV8xODA7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXModGhpcy5wZWVrKCkpKSB7XG4gICAgICBib2R5XzE4MCA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZl8xNzggPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGJvZHlfMTgwID0gZW5mXzE3OC5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB0aGlzLnJlc3QgPSBlbmZfMTc4LnJlc3Q7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycm93RXhwcmVzc2lvblwiLCB7cGFyYW1zOiBwYXJhbXNfMTc5LCBib2R5OiBib2R5XzE4MH0pO1xuICB9XG4gIGVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCkge1xuICAgIGxldCBrd2RfMTgxID0gdGhpcy5tYXRjaEtleXdvcmQoXCJ5aWVsZFwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzE4MiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCBsb29rYWhlYWRfMTgyICYmICF0aGlzLmxpbmVOdW1iZXJFcShrd2RfMTgxLCBsb29rYWhlYWRfMTgyKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBudWxsfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpc0dlbmVyYXRvciA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIipcIikpIHtcbiAgICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH1cbiAgICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIGxldCB0eXBlID0gaXNHZW5lcmF0b3IgPyBcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwiIDogXCJZaWVsZEV4cHJlc3Npb25cIjtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlLCB7ZXhwcmVzc2lvbjogZXhwcn0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFN5bnRheFRlbXBsYXRlKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN5bnRheFRlbXBsYXRlXCIsIHt0ZW1wbGF0ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdFN5bnRheFF1b3RlKCkge1xuICAgIGxldCBuYW1lXzE4MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN5bnRheFF1b3RlXCIsIHtuYW1lOiBuYW1lXzE4MywgdGVtcGxhdGU6IG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMTgzfSksIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSl9KTtcbiAgfVxuICBlbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9iamVjdF8xODQgPSB0aGlzLnRlcm07XG4gICAgbGV0IGRvdF8xODUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydHlfMTg2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiBvYmplY3RfMTg0LCBwcm9wZXJ0eTogcHJvcGVydHlfMTg2fSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGFycl8xODcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgZWxlbWVudHNfMTg4ID0gW107XG4gICAgbGV0IGVuZl8xODkgPSBuZXcgRW5mb3Jlc3Rlcl80NihhcnJfMTg3LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzE4OS5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gZW5mXzE4OS5wZWVrKCk7XG4gICAgICBpZiAoZW5mXzE4OS5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzE4OS5hZHZhbmNlKCk7XG4gICAgICAgIGVsZW1lbnRzXzE4OC5wdXNoKG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChlbmZfMTg5LmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIGVuZl8xODkuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZXhwcmVzc2lvbiA9IGVuZl8xODkuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mXzE4OS5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0aW5nIGV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudHNfMTg4LnB1c2gobmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByZXNzaW9ufSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHRlcm0gPSBlbmZfMTg5LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKHRlcm0gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xODkuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGVkIGV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudHNfMTg4LnB1c2godGVybSk7XG4gICAgICAgIGVuZl8xODkuY29uc3VtZUNvbW1hKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTg4KX0pO1xuICB9XG4gIGVuZm9yZXN0T2JqZWN0RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqXzE5MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzE5MSA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzE5MiA9IG5ldyBFbmZvcmVzdGVyXzQ2KG9ial8xOTAuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsYXN0UHJvcF8xOTMgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTkyLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBwcm9wID0gZW5mXzE5Mi5lbmZvcmVzdFByb3BlcnR5RGVmaW5pdGlvbigpO1xuICAgICAgZW5mXzE5Mi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIHByb3BlcnRpZXNfMTkxID0gcHJvcGVydGllc18xOTEuY29uY2F0KHByb3ApO1xuICAgICAgaWYgKGxhc3RQcm9wXzE5MyA9PT0gcHJvcCkge1xuICAgICAgICB0aHJvdyBlbmZfMTkyLmNyZWF0ZUVycm9yKHByb3AsIFwiaW52YWxpZCBzeW50YXggaW4gb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgbGFzdFByb3BfMTkzID0gcHJvcDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogcHJvcGVydGllc18xOTF9KTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5RGVmaW5pdGlvbigpIHtcbiAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IHRoaXMuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIFwibWV0aG9kXCI6XG4gICAgICAgIHJldHVybiBtZXRob2RPcktleTtcbiAgICAgIGNhc2UgXCJpZGVudGlmaWVyXCI6XG4gICAgICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7aW5pdDogaW5pdCwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKG1ldGhvZE9yS2V5KX0pO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCI6XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU2hvcnRoYW5kUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LnZhbHVlfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGxldCBleHByXzE5NCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogbWV0aG9kT3JLZXksIGV4cHJlc3Npb246IGV4cHJfMTk0fSk7XG4gIH1cbiAgZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTk1ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE5NiA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTk1LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE5NiA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xOTUsIFwiZ2V0XCIpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJHZXR0ZXJcIiwge25hbWU6IG5hbWUsIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTk1LCBcInNldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLm1hdGNoUGFyZW5zKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBwYXJhbSA9IGVuZi5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIlNldHRlclwiLCB7bmFtZTogbmFtZSwgcGFyYW06IHBhcmFtLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgbGV0IHBhcmFtcyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NihwYXJhbXMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBmb3JtYWxQYXJhbXMgPSBlbmYuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIk1ldGhvZFwiLCB7aXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE5NiwgbmFtZTogbmFtZSwgcGFyYW1zOiBmb3JtYWxQYXJhbXMsIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfVxuICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5hbWUsIGtpbmQ6IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xOTUpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xOTUpID8gXCJpZGVudGlmaWVyXCIgOiBcInByb3BlcnR5XCJ9O1xuICB9XG4gIGVuZm9yZXN0UHJvcGVydHlOYW1lKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTk3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xOTcpIHx8IHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTk3KSkge1xuICAgICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSksIGJpbmRpbmc6IG51bGx9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xOTcpKSB7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaFNxdWFyZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGV4cHIgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCIsIHtleHByZXNzaW9uOiBleHByfSksIGJpbmRpbmc6IG51bGx9O1xuICAgIH1cbiAgICBsZXQgbmFtZV8xOTggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogbmFtZV8xOTh9KSwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV8xOTh9KX07XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByLCBpbkRlZmF1bHQsIGFsbG93R2VuZXJhdG9yfSkge1xuICAgIGxldCBuYW1lXzE5OSA9IG51bGwsIHBhcmFtc18yMDAsIGJvZHlfMjAxLCByZXN0XzIwMjtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMjAzID0gZmFsc2U7XG4gICAgbGV0IGZuS2V5d29yZF8yMDQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzIwNSA9IHRoaXMucGVlaygpO1xuICAgIGxldCB0eXBlXzIwNiA9IGlzRXhwciA/IFwiRnVuY3Rpb25FeHByZXNzaW9uXCIgOiBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIwNSwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8yMDMgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMjA1ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjA1KSkge1xuICAgICAgbmFtZV8xOTkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9IGVsc2UgaWYgKGluRGVmYXVsdCkge1xuICAgICAgbmFtZV8xOTkgPSBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoXCIqZGVmYXVsdCpcIiwgZm5LZXl3b3JkXzIwNCl9KTtcbiAgICB9XG4gICAgcGFyYW1zXzIwMCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzIwMSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8yMDcgPSBuZXcgRW5mb3Jlc3Rlcl80NihwYXJhbXNfMjAwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18yMDggPSBlbmZfMjA3LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIwNiwge25hbWU6IG5hbWVfMTk5LCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMjAzLCBwYXJhbXM6IGZvcm1hbFBhcmFtc18yMDgsIGJvZHk6IGJvZHlfMjAxfSk7XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG5hbWVfMjA5ID0gbnVsbCwgcGFyYW1zXzIxMCwgYm9keV8yMTEsIHJlc3RfMjEyO1xuICAgIGxldCBpc0dlbmVyYXRvcl8yMTMgPSBmYWxzZTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzIxNCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjE0LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzIxMyA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZF8yMTQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8yMTQpKSB7XG4gICAgICBuYW1lXzIwOSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH1cbiAgICBwYXJhbXNfMjEwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMjExID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzIxNSA9IG5ldyBFbmZvcmVzdGVyXzQ2KHBhcmFtc18yMTAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzIxNiA9IGVuZl8yMTUuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25FeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzIwOSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIxMywgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjE2LCBib2R5OiBib2R5XzIxMX0pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbmFtZV8yMTcsIHBhcmFtc18yMTgsIGJvZHlfMjE5LCByZXN0XzIyMDtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMjIxID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMjIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIyMiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8yMjEgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIG5hbWVfMjE3ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgcGFyYW1zXzIxOCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzIxOSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8yMjMgPSBuZXcgRW5mb3Jlc3Rlcl80NihwYXJhbXNfMjE4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18yMjQgPSBlbmZfMjIzLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIiwge25hbWU6IG5hbWVfMjE3LCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMjIxLCBwYXJhbXM6IGZvcm1hbFBhcmFtc18yMjQsIGJvZHk6IGJvZHlfMjE5fSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCkge1xuICAgIGxldCBpdGVtc18yMjUgPSBbXTtcbiAgICBsZXQgcmVzdF8yMjYgPSBudWxsO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIuLi5cIikpIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIuLi5cIik7XG4gICAgICAgIHJlc3RfMjI2ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaXRlbXNfMjI1LnB1c2godGhpcy5lbmZvcmVzdFBhcmFtKCkpO1xuICAgICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IExpc3QoaXRlbXNfMjI1KSwgcmVzdDogcmVzdF8yMjZ9KTtcbiAgfVxuICBlbmZvcmVzdFBhcmFtKCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9wZXJhdG9yXzIyNyA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IGZhbHNlLCBvcGVyYXRvcjogb3BlcmF0b3JfMjI3LnZhbCgpLCBvcGVyYW5kOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGhpcy50ZXJtKX0pO1xuICB9XG4gIGVuZm9yZXN0VW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8yMjggPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe3ByZWM6IHRoaXMub3BDdHgucHJlYywgY29tYmluZTogdGhpcy5vcEN0eC5jb21iaW5lfSk7XG4gICAgdGhpcy5vcEN0eC5wcmVjID0gMTQ7XG4gICAgdGhpcy5vcEN0eC5jb21iaW5lID0gcmlnaHRUZXJtXzIyOSA9PiB7XG4gICAgICBsZXQgdHlwZV8yMzAsIHRlcm1fMjMxLCBpc1ByZWZpeF8yMzI7XG4gICAgICBpZiAob3BlcmF0b3JfMjI4LnZhbCgpID09PSBcIisrXCIgfHwgb3BlcmF0b3JfMjI4LnZhbCgpID09PSBcIi0tXCIpIHtcbiAgICAgICAgdHlwZV8yMzAgPSBcIlVwZGF0ZUV4cHJlc3Npb25cIjtcbiAgICAgICAgdGVybV8yMzEgPSB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcocmlnaHRUZXJtXzIyOSk7XG4gICAgICAgIGlzUHJlZml4XzIzMiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlXzIzMCA9IFwiVW5hcnlFeHByZXNzaW9uXCI7XG4gICAgICAgIGlzUHJlZml4XzIzMiA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGVybV8yMzEgPSByaWdodFRlcm1fMjI5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMjMwLCB7b3BlcmF0b3I6IG9wZXJhdG9yXzIyOC52YWwoKSwgb3BlcmFuZDogdGVybV8yMzEsIGlzUHJlZml4OiBpc1ByZWZpeF8yMzJ9KTtcbiAgICB9O1xuICAgIHJldHVybiBFWFBSX0xPT1BfT1BFUkFUT1JfNDM7XG4gIH1cbiAgZW5mb3Jlc3RDb25kaXRpb25hbEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IHRlc3RfMjMzID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgaWYgKHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiP1wiKTtcbiAgICBsZXQgZW5mXzIzNCA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjb25zZXF1ZW50XzIzNSA9IGVuZl8yMzQuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGVuZl8yMzQubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBlbmZfMjM0ID0gbmV3IEVuZm9yZXN0ZXJfNDYoZW5mXzIzNC5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFsdGVybmF0ZV8yMzYgPSBlbmZfMjM0LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB0aGlzLnJlc3QgPSBlbmZfMjM0LnJlc3Q7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0ZXN0XzIzMywgY29uc2VxdWVudDogY29uc2VxdWVudF8yMzUsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzIzNn0pO1xuICB9XG4gIGVuZm9yZXN0QmluYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbGVmdFRlcm1fMjM3ID0gdGhpcy50ZXJtO1xuICAgIGxldCBvcFN0eF8yMzggPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgb3BfMjM5ID0gb3BTdHhfMjM4LnZhbCgpO1xuICAgIGxldCBvcFByZWNfMjQwID0gZ2V0T3BlcmF0b3JQcmVjKG9wXzIzOSk7XG4gICAgbGV0IG9wQXNzb2NfMjQxID0gZ2V0T3BlcmF0b3JBc3NvYyhvcF8yMzkpO1xuICAgIGlmIChvcGVyYXRvckx0KHRoaXMub3BDdHgucHJlYywgb3BQcmVjXzI0MCwgb3BBc3NvY18yNDEpKSB7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gb3BQcmVjXzI0MDtcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yNDIgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0VGVybV8yMzcsIG9wZXJhdG9yOiBvcFN0eF8yMzgsIHJpZ2h0OiByaWdodFRlcm1fMjQyfSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzQzO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMub3BDdHguY29tYmluZShsZWZ0VGVybV8yMzcpO1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgIHJldHVybiB0ZXJtO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDMgPSB0aGlzLm1hdGNoVGVtcGxhdGUoKTtcbiAgICBsZXQgZWxlbWVudHNfMjQ0ID0gbG9va2FoZWFkXzI0My50b2tlbi5pdGVtcy5tYXAoaXRfMjQ1ID0+IHtcbiAgICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKGl0XzI0NSkpIHtcbiAgICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyXzQ2KGl0XzI0NS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHJldHVybiBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogaXRfMjQ1LnNsaWNlLnRleHR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZWxlbWVudHNfMjQ0O1xuICB9XG4gIGV4cGFuZE1hY3JvKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjQ2ID0gdGhpcy5wZWVrKCk7XG4gICAgd2hpbGUgKHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfMjQ2KSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBzeW50YXhUcmFuc2Zvcm0gPSB0aGlzLmdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KG5hbWUpO1xuICAgICAgaWYgKHN5bnRheFRyYW5zZm9ybSA9PSBudWxsIHx8IHR5cGVvZiBzeW50YXhUcmFuc2Zvcm0udmFsdWUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWUsIFwidGhlIG1hY3JvIG5hbWUgd2FzIG5vdCBib3VuZCB0byBhIHZhbHVlIHRoYXQgY291bGQgYmUgaW52b2tlZFwiKTtcbiAgICAgIH1cbiAgICAgIGxldCB1c2VTaXRlU2NvcGUgPSBmcmVzaFNjb3BlKFwidVwiKTtcbiAgICAgIGxldCBpbnRyb2R1Y2VkU2NvcGUgPSBmcmVzaFNjb3BlKFwiaVwiKTtcbiAgICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZTtcbiAgICAgIGxldCBjdHggPSBuZXcgTWFjcm9Db250ZXh0KHRoaXMsIG5hbWUsIHRoaXMuY29udGV4dCwgdXNlU2l0ZVNjb3BlLCBpbnRyb2R1Y2VkU2NvcGUpO1xuICAgICAgbGV0IHJlc3VsdCA9IHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoc3ludGF4VHJhbnNmb3JtLnZhbHVlLmNhbGwobnVsbCwgY3R4KSk7XG4gICAgICBpZiAoIUxpc3QuaXNMaXN0KHJlc3VsdCkpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lLCBcIm1hY3JvIG11c3QgcmV0dXJuIGEgbGlzdCBidXQgZ290OiBcIiArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICByZXN1bHQgPSByZXN1bHQubWFwKHN0eF8yNDcgPT4ge1xuICAgICAgICBpZiAoIShzdHhfMjQ3ICYmIHR5cGVvZiBzdHhfMjQ3LmFkZFNjb3BlID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lLCBcIm1hY3JvIG11c3QgcmV0dXJuIHN5bnRheCBvYmplY3RzIG9yIHRlcm1zIGJ1dCBnb3Q6IFwiICsgc3R4XzI0Nyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eF8yNDcuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlLCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMsIHtmbGlwOiB0cnVlfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVzdCA9IHJlc3VsdC5jb25jYXQoY3R4Ll9yZXN0KHRoaXMpKTtcbiAgICAgIGxvb2thaGVhZF8yNDYgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gIH1cbiAgY29uc3VtZVNlbWljb2xvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI0OCA9IHRoaXMucGVlaygpO1xuICAgIGlmIChsb29rYWhlYWRfMjQ4ICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yNDgsIFwiO1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICB9XG4gIGNvbnN1bWVDb21tYSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI0OSA9IHRoaXMucGVlaygpO1xuICAgIGlmIChsb29rYWhlYWRfMjQ5ICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yNDksIFwiLFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICB9XG4gIHNhZmVDaGVjayhvYmpfMjUwLCB0eXBlXzI1MSwgdmFsXzI1MiA9IG51bGwpIHtcbiAgICByZXR1cm4gb2JqXzI1MCAmJiAodHlwZW9mIG9ial8yNTAubWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG9ial8yNTAubWF0Y2godHlwZV8yNTEsIHZhbF8yNTIpIDogZmFsc2UpO1xuICB9XG4gIGlzVGVybSh0ZXJtXzI1Mykge1xuICAgIHJldHVybiB0ZXJtXzI1MyAmJiB0ZXJtXzI1MyBpbnN0YW5jZW9mIFRlcm07XG4gIH1cbiAgaXNFT0Yob2JqXzI1NCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjU0LCBcImVvZlwiKTtcbiAgfVxuICBpc0lkZW50aWZpZXIob2JqXzI1NSwgdmFsXzI1NiA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI1NSwgXCJpZGVudGlmaWVyXCIsIHZhbF8yNTYpO1xuICB9XG4gIGlzUHJvcGVydHlOYW1lKG9ial8yNTcpIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWZpZXIob2JqXzI1NykgfHwgdGhpcy5pc0tleXdvcmQob2JqXzI1NykgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKG9ial8yNTcpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKG9ial8yNTcpIHx8IHRoaXMuaXNCcmFja2V0cyhvYmpfMjU3KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKG9ial8yNTgsIHZhbF8yNTkgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNTgsIFwibnVtYmVyXCIsIHZhbF8yNTkpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbChvYmpfMjYwLCB2YWxfMjYxID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjYwLCBcInN0cmluZ1wiLCB2YWxfMjYxKTtcbiAgfVxuICBpc1RlbXBsYXRlKG9ial8yNjIsIHZhbF8yNjMgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNjIsIFwidGVtcGxhdGVcIiwgdmFsXzI2Myk7XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZShvYmpfMjY0KSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNjQsIFwic3ludGF4VGVtcGxhdGVcIik7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbChvYmpfMjY1LCB2YWxfMjY2ID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjY1LCBcImJvb2xlYW5cIiwgdmFsXzI2Nik7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbChvYmpfMjY3LCB2YWxfMjY4ID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjY3LCBcIm51bGxcIiwgdmFsXzI2OCk7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbihvYmpfMjY5LCB2YWxfMjcwID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjY5LCBcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbF8yNzApO1xuICB9XG4gIGlzRGVsaW1pdGVyKG9ial8yNzEpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI3MSwgXCJkZWxpbWl0ZXJcIik7XG4gIH1cbiAgaXNQYXJlbnMob2JqXzI3Mikge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjcyLCBcInBhcmVuc1wiKTtcbiAgfVxuICBpc0JyYWNlcyhvYmpfMjczKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNzMsIFwiYnJhY2VzXCIpO1xuICB9XG4gIGlzQnJhY2tldHMob2JqXzI3NCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjc0LCBcImJyYWNrZXRzXCIpO1xuICB9XG4gIGlzQXNzaWduKG9ial8yNzUsIHZhbF8yNzYgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNzUsIFwiYXNzaWduXCIsIHZhbF8yNzYpO1xuICB9XG4gIGlzS2V5d29yZChvYmpfMjc3LCB2YWxfMjc4ID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjc3LCBcImtleXdvcmRcIiwgdmFsXzI3OCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKG9ial8yNzksIHZhbF8yODAgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNzksIFwicHVuY3R1YXRvclwiLCB2YWxfMjgwKTtcbiAgfVxuICBpc09wZXJhdG9yKG9ial8yODEpIHtcbiAgICByZXR1cm4gKHRoaXMuc2FmZUNoZWNrKG9ial8yODEsIFwicHVuY3R1YXRvclwiKSB8fCB0aGlzLnNhZmVDaGVjayhvYmpfMjgxLCBcImlkZW50aWZpZXJcIikgfHwgdGhpcy5zYWZlQ2hlY2sob2JqXzI4MSwgXCJrZXl3b3JkXCIpKSAmJiBpc09wZXJhdG9yKG9ial8yODEpO1xuICB9XG4gIGlzVXBkYXRlT3BlcmF0b3Iob2JqXzI4Mikge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjgyLCBcInB1bmN0dWF0b3JcIiwgXCIrK1wiKSB8fCB0aGlzLnNhZmVDaGVjayhvYmpfMjgyLCBcInB1bmN0dWF0b3JcIiwgXCItLVwiKTtcbiAgfVxuICBzYWZlUmVzb2x2ZShvYmpfMjgzLCBwaGFzZV8yODQpIHtcbiAgICByZXR1cm4gb2JqXzI4MyAmJiB0eXBlb2Ygb2JqXzI4My5yZXNvbHZlID09PSBcImZ1bmN0aW9uXCIgPyBKdXN0XzQxKG9ial8yODMucmVzb2x2ZShwaGFzZV8yODQpKSA6IE5vdGhpbmdfNDIoKTtcbiAgfVxuICBpc1RyYW5zZm9ybShvYmpfMjg1LCB0cmFuc18yODYpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlUmVzb2x2ZShvYmpfMjg1LCB0aGlzLmNvbnRleHQucGhhc2UpLm1hcChuYW1lXzI4NyA9PiB0aGlzLmNvbnRleHQuZW52LmdldChuYW1lXzI4NykgPT09IHRyYW5zXzI4NiB8fCB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KG5hbWVfMjg3KSA9PT0gdHJhbnNfMjg2KS5nZXRPckVsc2UoZmFsc2UpO1xuICB9XG4gIGlzVHJhbnNmb3JtSW5zdGFuY2Uob2JqXzI4OCwgdHJhbnNfMjg5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZVJlc29sdmUob2JqXzI4OCwgdGhpcy5jb250ZXh0LnBoYXNlKS5tYXAobmFtZV8yOTAgPT4gdGhpcy5jb250ZXh0LmVudi5nZXQobmFtZV8yOTApIGluc3RhbmNlb2YgdHJhbnNfMjg5IHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQobmFtZV8yOTApIGluc3RhbmNlb2YgdHJhbnNfMjg5KS5nZXRPckVsc2UoZmFsc2UpO1xuICB9XG4gIGlzRm5EZWNsVHJhbnNmb3JtKG9ial8yOTEpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjkxLCBGdW5jdGlvbkRlY2xUcmFuc2Zvcm0pO1xuICB9XG4gIGlzVmFyRGVjbFRyYW5zZm9ybShvYmpfMjkyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5MiwgVmFyaWFibGVEZWNsVHJhbnNmb3JtKTtcbiAgfVxuICBpc0xldERlY2xUcmFuc2Zvcm0ob2JqXzI5Mykge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yOTMsIExldERlY2xUcmFuc2Zvcm0pO1xuICB9XG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKG9ial8yOTQpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjk0LCBDb25zdERlY2xUcmFuc2Zvcm0pO1xuICB9XG4gIGlzU3ludGF4RGVjbFRyYW5zZm9ybShvYmpfMjk1KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5NSwgU3ludGF4RGVjbFRyYW5zZm9ybSk7XG4gIH1cbiAgaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKG9ial8yOTYpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjk2LCBTeW50YXhyZWNEZWNsVHJhbnNmb3JtKTtcbiAgfVxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKG9ial8yOTcpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjk3LCBTeW50YXhRdW90ZVRyYW5zZm9ybSk7XG4gIH1cbiAgaXNSZXR1cm5TdG10VHJhbnNmb3JtKG9ial8yOTgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjk4LCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0pO1xuICB9XG4gIGlzV2hpbGVUcmFuc2Zvcm0ob2JqXzI5OSkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yOTksIFdoaWxlVHJhbnNmb3JtKTtcbiAgfVxuICBpc0ZvclRyYW5zZm9ybShvYmpfMzAwKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwMCwgRm9yVHJhbnNmb3JtKTtcbiAgfVxuICBpc1N3aXRjaFRyYW5zZm9ybShvYmpfMzAxKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwMSwgU3dpdGNoVHJhbnNmb3JtKTtcbiAgfVxuICBpc0JyZWFrVHJhbnNmb3JtKG9ial8zMDIpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzAyLCBCcmVha1RyYW5zZm9ybSk7XG4gIH1cbiAgaXNDb250aW51ZVRyYW5zZm9ybShvYmpfMzAzKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwMywgQ29udGludWVUcmFuc2Zvcm0pO1xuICB9XG4gIGlzRG9UcmFuc2Zvcm0ob2JqXzMwNCkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8zMDQsIERvVHJhbnNmb3JtKTtcbiAgfVxuICBpc0RlYnVnZ2VyVHJhbnNmb3JtKG9ial8zMDUpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzA1LCBEZWJ1Z2dlclRyYW5zZm9ybSk7XG4gIH1cbiAgaXNXaXRoVHJhbnNmb3JtKG9ial8zMDYpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzA2LCBXaXRoVHJhbnNmb3JtKTtcbiAgfVxuICBpc1RyeVRyYW5zZm9ybShvYmpfMzA3KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwNywgVHJ5VHJhbnNmb3JtKTtcbiAgfVxuICBpc1Rocm93VHJhbnNmb3JtKG9ial8zMDgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzA4LCBUaHJvd1RyYW5zZm9ybSk7XG4gIH1cbiAgaXNJZlRyYW5zZm9ybShvYmpfMzA5KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwOSwgSWZUcmFuc2Zvcm0pO1xuICB9XG4gIGlzTmV3VHJhbnNmb3JtKG9ial8zMTApIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzEwLCBOZXdUcmFuc2Zvcm0pO1xuICB9XG4gIGlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0ob2JqXzMxMSkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtSW5zdGFuY2Uob2JqXzMxMSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm0pO1xuICB9XG4gIGlzVmFyQmluZGluZ1RyYW5zZm9ybShvYmpfMzEyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm1JbnN0YW5jZShvYmpfMzEyLCBWYXJCaW5kaW5nVHJhbnNmb3JtKTtcbiAgfVxuICBnZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudCh0ZXJtXzMxMykge1xuICAgIGlmICh0aGlzLmNvbnRleHQuZW52Lmhhcyh0ZXJtXzMxMy5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8zMTMucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8zMTMucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKTtcbiAgfVxuICBsaW5lTnVtYmVyRXEoYV8zMTQsIGJfMzE1KSB7XG4gICAgaWYgKCEoYV8zMTQgJiYgYl8zMTUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBhXzMxNC5saW5lTnVtYmVyKCkgPT09IGJfMzE1LmxpbmVOdW1iZXIoKTtcbiAgfVxuICBtYXRjaElkZW50aWZpZXIodmFsXzMxNikge1xuICAgIGxldCBsb29rYWhlYWRfMzE3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8zMTcpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMxNztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzE3LCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG4gIG1hdGNoS2V5d29yZCh2YWxfMzE4KSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMTkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzMxOSwgdmFsXzMxOCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzE5O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMTksIFwiZXhwZWN0aW5nIFwiICsgdmFsXzMxOCk7XG4gIH1cbiAgbWF0Y2hMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzIwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMzIwKSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMzIwKSB8fCB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzMyMCkgfHwgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8zMjApIHx8IHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMzIwKSB8fCB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzMyMCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzIwO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjAsIFwiZXhwZWN0aW5nIGEgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFN0cmluZ0xpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMjEgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzMyMSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzIxO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjEsIFwiZXhwZWN0aW5nIGEgc3RyaW5nIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hUZW1wbGF0ZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMyMiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzMyMikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzIyO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjIsIFwiZXhwZWN0aW5nIGEgdGVtcGxhdGUgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFBhcmVucygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMyMyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8zMjMpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMyMy5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjMsIFwiZXhwZWN0aW5nIHBhcmVuc1wiKTtcbiAgfVxuICBtYXRjaEN1cmxpZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMjQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMzI0KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMjQuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzI0LCBcImV4cGVjdGluZyBjdXJseSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hTcXVhcmVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzI1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMzI1KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMjUuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzI1LCBcImV4cGVjdGluZyBzcWF1cmUgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoVW5hcnlPcGVyYXRvcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMyNiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChpc1VuYXJ5T3BlcmF0b3IobG9va2FoZWFkXzMyNikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzI2O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjYsIFwiZXhwZWN0aW5nIGEgdW5hcnkgb3BlcmF0b3JcIik7XG4gIH1cbiAgbWF0Y2hQdW5jdHVhdG9yKHZhbF8zMjcpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMyOCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMzI4KSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWxfMzI3ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmIChsb29rYWhlYWRfMzI4LnZhbCgpID09PSB2YWxfMzI3KSB7XG4gICAgICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMjg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzI4LCBcImV4cGVjdGluZyBhIFwiICsgdmFsXzMyNyArIFwiIHB1bmN0dWF0b3JcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzI4O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zMjgsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuICBjcmVhdGVFcnJvcihzdHhfMzI5LCBtZXNzYWdlXzMzMCkge1xuICAgIGxldCBjdHhfMzMxID0gXCJcIjtcbiAgICBsZXQgb2ZmZW5kaW5nXzMzMiA9IHN0eF8zMjk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgY3R4XzMzMSA9IHRoaXMucmVzdC5zbGljZSgwLCAyMCkubWFwKHRlcm1fMzMzID0+IHtcbiAgICAgICAgaWYgKHRlcm1fMzMzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGVybV8zMzMuaW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGlzdC5vZih0ZXJtXzMzMyk7XG4gICAgICB9KS5mbGF0dGVuKCkubWFwKHNfMzM0ID0+IHtcbiAgICAgICAgaWYgKHNfMzM0ID09PSBvZmZlbmRpbmdfMzMyKSB7XG4gICAgICAgICAgcmV0dXJuIFwiX19cIiArIHNfMzM0LnZhbCgpICsgXCJfX1wiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzXzMzNC52YWwoKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHhfMzMxID0gb2ZmZW5kaW5nXzMzMi50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEVycm9yKG1lc3NhZ2VfMzMwICsgXCJcXG5cIiArIGN0eF8zMzEpO1xuICB9XG59XG5leHBvcnQge0VuZm9yZXN0ZXJfNDYgYXMgRW5mb3Jlc3Rlcn0iXX0=