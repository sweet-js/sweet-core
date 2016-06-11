"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImportDeclaration = exports.isCompiletimeStatement = exports.isCompiletimeDeclaration = exports.isSyntaxDeclarationStatement = exports.isExportSyntax = exports.isParenthesizedExpression = exports.isFunctionWithName = exports.isFunctionTerm = exports.isSyntaxrecDeclaration = exports.isSyntaxDeclaration = exports.isEOF = exports.isVariableDeclarator = exports.isVariableDeclaration = exports.isSyntaxTemplate = exports.isTemplateElement = exports.isSwitchDefault = exports.isSwitchCase = exports.isSuper = exports.isSpreadElement = exports.isScript = exports.isFunctionDeclaration = exports.isFunctionBody = exports.isFormalParameters = exports.isDirective = exports.isCatchClause = exports.isBlock = exports.isPragma = exports.isWithStatement = exports.isWhileStatement = exports.isVariableDeclarationStatement = exports.isTryFinallyStatement = exports.isTryCatchStatement = exports.isThrowStatement = exports.isSwitchStatementWithDefault = exports.isSwitchStatement = exports.isReturnStatement = exports.isLabeledStatement = exports.isIfStatement = exports.isForStatement = exports.isForOfStatement = exports.isForInStatement = exports.isExpressionStatement = exports.isEmptyStatement = exports.isDoWhileStatement = exports.isDebuggerStatement = exports.isCompoundAssignmentExpression = exports.isContinueStatement = exports.isBreakStatement = exports.isBlockStatement = exports.isYieldGeneratorExpression = exports.isYieldExpression = exports.isUpdateExpression = exports.isThisExpression = exports.isTemplateExpression = exports.isStaticMemberExpression = exports.isUnaryExpression = exports.isObjectExpression = exports.isNewTargetExpression = exports.isNewExpression = exports.isIdentifierExpression = exports.isFunctionExpression = exports.isConditionalExpression = exports.isComputedMemberExpression = exports.isComputedAssignmentExpression = exports.isCallExpression = exports.isBinaryExpression = exports.isAssignmentExpression = exports.isArrowExpression = exports.isArrayExpression = exports.isLiteralStringExpression = exports.isLiteralRegExpExpression = exports.isLiteralNumericExpression = exports.isLiteralNullExpression = exports.isLiteralInfinityExpression = exports.isLiteralBooleanExpression = exports.isStaticPropertyName = exports.isComputedPropertyName = exports.isShorthandProperty = exports.isDataProperty = exports.isSetter = exports.isGetter = exports.isMethod = exports.isExportSpecifier = exports.isExportDefault = exports.isExport = exports.isExportFrom = exports.isExportAllFrom = exports.isImportSpecifier = exports.isImportNamespace = exports.isImport = exports.isModule = exports.isClassElement = exports.isClassDeclaration = exports.isClassExpression = exports.isBindingPropertyProperty = exports.isBindingPropertyIdentifier = exports.isObjectBinding = exports.isArrayBinding = exports.isBindingIdentifier = exports.isBindingWithDefault = undefined;

var _immutable = require("immutable");

var _errors = require("./errors");

var _utils = require("./utils");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Term {
  constructor(type_1054, props_1055) {
    this.type = type_1054;
    this.loc = null;
    for (let prop of Object.keys(props_1055)) {
      this[prop] = props_1055[prop];
    }
  }
  extend(props_1056) {
    let newProps_1057 = {};
    for (let field of fieldsIn_1053(this)) {
      if (props_1056.hasOwnProperty(field)) {
        newProps_1057[field] = props_1056[field];
      } else {
        newProps_1057[field] = this[field];
      }
    }
    return new Term(this.type, newProps_1057);
  }
  gen() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? { includeImports: true } : arguments[0];

    let includeImports = _ref.includeImports;

    let next_1058 = {};
    for (let field of fieldsIn_1053(this)) {
      if (this[field] == null) {
        next_1058[field] = null;
      } else if (this[field] instanceof Term) {
        next_1058[field] = this[field].gen(includeImports);
      } else if (_immutable.List.isList(this[field])) {
        let pred = includeImports ? R.complement(isCompiletimeStatement) : R.both(R.complement(isImportDeclaration), R.complement(isCompiletimeStatement));
        next_1058[field] = this[field].filter(pred).map(term_1059 => term_1059 instanceof Term ? term_1059.gen(includeImports) : term_1059);
      } else {
        next_1058[field] = this[field];
      }
    }
    return new Term(this.type, next_1058);
  }
  visit(f_1060) {
    let next_1061 = {};
    for (let field of fieldsIn_1053(this)) {
      if (this[field] == null) {
        next_1061[field] = null;
      } else if (_immutable.List.isList(this[field])) {
        next_1061[field] = this[field].map(field_1062 => field_1062 != null ? f_1060(field_1062) : null);
      } else {
        next_1061[field] = f_1060(this[field]);
      }
    }
    return this.extend(next_1061);
  }
  addScope(scope_1063, bindings_1064, phase_1065, options_1066) {
    return this.visit(term_1067 => {
      if (typeof term_1067.addScope === "function") {
        return term_1067.addScope(scope_1063, bindings_1064, phase_1065, options_1066);
      }
      return term_1067;
    });
  }
  removeScope(scope_1068, phase_1069) {
    return this.visit(term_1070 => {
      if (typeof term_1070.removeScope === "function") {
        return term_1070.removeScope(scope_1068, phase_1069);
      }
      return term_1070;
    });
  }
  lineNumber() {
    for (let field of fieldsIn_1053(this)) {
      if (typeof this[field] && this[field].lineNumber === "function") {
        return this[field].lineNumber();
      }
    }
  }
  setLineNumber(line_1071) {
    let next_1072 = {};
    for (let field of fieldsIn_1053(this)) {
      if (this[field] == null) {
        next_1072[field] = null;
      } else if (typeof this[field].setLineNumber === "function") {
        next_1072[field] = this[field].setLineNumber(line_1071);
      } else if (_immutable.List.isList(this[field])) {
        next_1072[field] = this[field].map(f_1073 => f_1073.setLineNumber(line_1071));
      } else {
        next_1072[field] = this[field];
      }
    }
    return new Term(this.type, next_1072);
  }
}
exports.default = Term;
const isBindingWithDefault = exports.isBindingWithDefault = R.whereEq({ type: "BindingWithDefault" });
;
const isBindingIdentifier = exports.isBindingIdentifier = R.whereEq({ type: "BindingIdentifier" });
;
const isArrayBinding = exports.isArrayBinding = R.whereEq({ type: "ArrayBinding" });
;
const isObjectBinding = exports.isObjectBinding = R.whereEq({ type: "ObjectBinding" });
;
const isBindingPropertyIdentifier = exports.isBindingPropertyIdentifier = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isBindingPropertyProperty = exports.isBindingPropertyProperty = R.whereEq({ type: "BindingPropertyIdentifier" });
;
const isClassExpression = exports.isClassExpression = R.whereEq({ type: "ClassExpression" });
;
const isClassDeclaration = exports.isClassDeclaration = R.whereEq({ type: "ClassDeclaration" });
;
const isClassElement = exports.isClassElement = R.whereEq({ type: "ClassElement" });
;
const isModule = exports.isModule = R.whereEq({ type: "Module" });
;
const isImport = exports.isImport = R.whereEq({ type: "Import" });
;
const isImportNamespace = exports.isImportNamespace = R.whereEq({ type: "ImportNamespace" });
;
const isImportSpecifier = exports.isImportSpecifier = R.whereEq({ type: "ImportSpecifier" });
;
const isExportAllFrom = exports.isExportAllFrom = R.whereEq({ type: "ExportAllFrom" });
;
const isExportFrom = exports.isExportFrom = R.whereEq({ type: "ExportFrom" });
;
const isExport = exports.isExport = R.whereEq({ type: "Export" });
;
const isExportDefault = exports.isExportDefault = R.whereEq({ type: "ExportDefault" });
;
const isExportSpecifier = exports.isExportSpecifier = R.whereEq({ type: "ExportSpecifier" });
;
const isMethod = exports.isMethod = R.whereEq({ type: "Method" });
;
const isGetter = exports.isGetter = R.whereEq({ type: "Getter" });
;
const isSetter = exports.isSetter = R.whereEq({ type: "Setter" });
;
const isDataProperty = exports.isDataProperty = R.whereEq({ type: "DataProperty" });
;
const isShorthandProperty = exports.isShorthandProperty = R.whereEq({ type: "ShorthandProperty" });
;
const isComputedPropertyName = exports.isComputedPropertyName = R.whereEq({ type: "ComputedPropertyName" });
;
const isStaticPropertyName = exports.isStaticPropertyName = R.whereEq({ type: "StaticPropertyName" });
;
const isLiteralBooleanExpression = exports.isLiteralBooleanExpression = R.whereEq({ type: "LiteralBooleanExpression" });
;
const isLiteralInfinityExpression = exports.isLiteralInfinityExpression = R.whereEq({ type: "LiteralInfinityExpression" });
;
const isLiteralNullExpression = exports.isLiteralNullExpression = R.whereEq({ type: "LiteralNullExpression" });
;
const isLiteralNumericExpression = exports.isLiteralNumericExpression = R.whereEq({ type: "LiteralNumericExpression" });
;
const isLiteralRegExpExpression = exports.isLiteralRegExpExpression = R.whereEq({ type: "LiteralRegExpExpression" });
;
const isLiteralStringExpression = exports.isLiteralStringExpression = R.whereEq({ type: "LiteralStringExpression" });
;
const isArrayExpression = exports.isArrayExpression = R.whereEq({ type: "ArrayExpression" });
;
const isArrowExpression = exports.isArrowExpression = R.whereEq({ type: "ArrowExpression" });
;
const isAssignmentExpression = exports.isAssignmentExpression = R.whereEq({ type: "AssignmentExpression" });
;
const isBinaryExpression = exports.isBinaryExpression = R.whereEq({ type: "BinaryExpression" });
;
const isCallExpression = exports.isCallExpression = R.whereEq({ type: "CallExpression" });
;
const isComputedAssignmentExpression = exports.isComputedAssignmentExpression = R.whereEq({ type: "ComputedAssignmentExpression" });
;
const isComputedMemberExpression = exports.isComputedMemberExpression = R.whereEq({ type: "ComputedMemberExpression" });
;
const isConditionalExpression = exports.isConditionalExpression = R.whereEq({ type: "ConditionalExpression" });
;
const isFunctionExpression = exports.isFunctionExpression = R.whereEq({ type: "FunctionExpression" });
;
const isIdentifierExpression = exports.isIdentifierExpression = R.whereEq({ type: "IdentifierExpression" });
;
const isNewExpression = exports.isNewExpression = R.whereEq({ type: "NewExpression" });
;
const isNewTargetExpression = exports.isNewTargetExpression = R.whereEq({ type: "NewTargetExpression" });
;
const isObjectExpression = exports.isObjectExpression = R.whereEq({ type: "ObjectExpression" });
;
const isUnaryExpression = exports.isUnaryExpression = R.whereEq({ type: "UnaryExpression" });
;
const isStaticMemberExpression = exports.isStaticMemberExpression = R.whereEq({ type: "StaticMemberExpression" });
;
const isTemplateExpression = exports.isTemplateExpression = R.whereEq({ type: "TemplateExpression" });
;
const isThisExpression = exports.isThisExpression = R.whereEq({ type: "ThisExpression" });
;
const isUpdateExpression = exports.isUpdateExpression = R.whereEq({ type: "UpdateExpression" });
;
const isYieldExpression = exports.isYieldExpression = R.whereEq({ type: "YieldExpression" });
;
const isYieldGeneratorExpression = exports.isYieldGeneratorExpression = R.whereEq({ type: "YieldGeneratorExpression" });
;
const isBlockStatement = exports.isBlockStatement = R.whereEq({ type: "BlockStatement" });
;
const isBreakStatement = exports.isBreakStatement = R.whereEq({ type: "BreakStatement" });
;
const isContinueStatement = exports.isContinueStatement = R.whereEq({ type: "ContinueStatement" });
;
const isCompoundAssignmentExpression = exports.isCompoundAssignmentExpression = R.whereEq({ type: "CompoundAssignmentExpression" });
;
const isDebuggerStatement = exports.isDebuggerStatement = R.whereEq({ type: "DebuggerStatement" });
;
const isDoWhileStatement = exports.isDoWhileStatement = R.whereEq({ type: "DoWhileStatement" });
;
const isEmptyStatement = exports.isEmptyStatement = R.whereEq({ type: "EmptyStatement" });
;
const isExpressionStatement = exports.isExpressionStatement = R.whereEq({ type: "ExpressionStatement" });
;
const isForInStatement = exports.isForInStatement = R.whereEq({ type: "ForInStatement" });
;
const isForOfStatement = exports.isForOfStatement = R.whereEq({ type: "ForOfStatement" });
;
const isForStatement = exports.isForStatement = R.whereEq({ type: "ForStatement" });
;
const isIfStatement = exports.isIfStatement = R.whereEq({ type: "IfStatement" });
;
const isLabeledStatement = exports.isLabeledStatement = R.whereEq({ type: "LabeledStatement" });
;
const isReturnStatement = exports.isReturnStatement = R.whereEq({ type: "ReturnStatement" });
;
const isSwitchStatement = exports.isSwitchStatement = R.whereEq({ type: "SwitchStatement" });
;
const isSwitchStatementWithDefault = exports.isSwitchStatementWithDefault = R.whereEq({ type: "SwitchStatementWithDefault" });
;
const isThrowStatement = exports.isThrowStatement = R.whereEq({ type: "ThrowStatement" });
;
const isTryCatchStatement = exports.isTryCatchStatement = R.whereEq({ type: "TryCatchStatement" });
;
const isTryFinallyStatement = exports.isTryFinallyStatement = R.whereEq({ type: "TryFinallyStatement" });
;
const isVariableDeclarationStatement = exports.isVariableDeclarationStatement = R.whereEq({ type: "VariableDeclarationStatement" });
;
const isWhileStatement = exports.isWhileStatement = R.whereEq({ type: "WhileStatement" });
;
const isWithStatement = exports.isWithStatement = R.whereEq({ type: "WithStatement" });
;
const isPragma = exports.isPragma = R.whereEq({ type: "Pragma" });
;
const isBlock = exports.isBlock = R.whereEq({ type: "Block" });
;
const isCatchClause = exports.isCatchClause = R.whereEq({ type: "CatchClause" });
;
const isDirective = exports.isDirective = R.whereEq({ type: "Directive" });
;
const isFormalParameters = exports.isFormalParameters = R.whereEq({ type: "FormalParameters" });
;
const isFunctionBody = exports.isFunctionBody = R.whereEq({ type: "FunctionBody" });
;
const isFunctionDeclaration = exports.isFunctionDeclaration = R.whereEq({ type: "FunctionDeclaration" });
;
const isScript = exports.isScript = R.whereEq({ type: "Script" });
;
const isSpreadElement = exports.isSpreadElement = R.whereEq({ type: "SpreadElement" });
;
const isSuper = exports.isSuper = R.whereEq({ type: "Super" });
;
const isSwitchCase = exports.isSwitchCase = R.whereEq({ type: "SwitchCase" });
;
const isSwitchDefault = exports.isSwitchDefault = R.whereEq({ type: "SwitchDefault" });
;
const isTemplateElement = exports.isTemplateElement = R.whereEq({ type: "TemplateElement" });
;
const isSyntaxTemplate = exports.isSyntaxTemplate = R.whereEq({ type: "SyntaxTemplate" });
;
const isVariableDeclaration = exports.isVariableDeclaration = R.whereEq({ type: "VariableDeclaration" });
;
const isVariableDeclarator = exports.isVariableDeclarator = R.whereEq({ type: "VariableDeclarator" });
;
const isEOF = exports.isEOF = R.whereEq({ type: "EOF" });
;
const isSyntaxDeclaration = exports.isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: "syntax" }));
;
const isSyntaxrecDeclaration = exports.isSyntaxrecDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: "syntaxrec" }));
;
const isFunctionTerm = exports.isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
;
const isFunctionWithName = exports.isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
;
const isParenthesizedExpression = exports.isParenthesizedExpression = R.whereEq({ type: "ParenthesizedExpression" });
;
const isExportSyntax = exports.isExportSyntax = R.both(isExport, exp_1074 => R.or(isSyntaxDeclaration(exp_1074.declaration), isSyntaxrecDeclaration(exp_1074.declaration)));
;
const isSyntaxDeclarationStatement = exports.isSyntaxDeclarationStatement = R.both(isVariableDeclarationStatement, decl_1075 => isCompiletimeDeclaration(decl_1075.declaration));
;
const isCompiletimeDeclaration = exports.isCompiletimeDeclaration = R.either(isSyntaxDeclaration, isSyntaxrecDeclaration);
;
const isCompiletimeStatement = exports.isCompiletimeStatement = term_1076 => {
  return term_1076 instanceof Term && isVariableDeclarationStatement(term_1076) && isCompiletimeDeclaration(term_1076.declaration);
};
;
const isImportDeclaration = exports.isImportDeclaration = R.either(isImport, isImportNamespace);
;
const fieldsIn_1053 = R.cond([[isBindingWithDefault, R.always(_immutable.List.of("binding", "init"))], [isBindingIdentifier, R.always(_immutable.List.of("name"))], [isArrayBinding, R.always(_immutable.List.of("elements", "restElement"))], [isObjectBinding, R.always(_immutable.List.of("properties"))], [isBindingPropertyIdentifier, R.always(_immutable.List.of("binding", "init"))], [isBindingPropertyProperty, R.always(_immutable.List.of("name", "binding"))], [isClassExpression, R.always(_immutable.List.of("name", "super", "elements"))], [isClassDeclaration, R.always(_immutable.List.of("name", "super", "elements"))], [isClassElement, R.always(_immutable.List.of("isStatic", "method"))], [isModule, R.always(_immutable.List.of("directives", "items"))], [isImport, R.always(_immutable.List.of("moduleSpecifier", "defaultBinding", "namedImports", "forSyntax"))], [isImportNamespace, R.always(_immutable.List.of("moduleSpecifier", "defaultBinding", "namespaceBinding"))], [isImportSpecifier, R.always(_immutable.List.of("name", "binding"))], [isExportAllFrom, R.always(_immutable.List.of("moduleSpecifier"))], [isExportFrom, R.always(_immutable.List.of("namedExports", "moduleSpecifier"))], [isExport, R.always(_immutable.List.of("declaration"))], [isExportDefault, R.always(_immutable.List.of("body"))], [isExportSpecifier, R.always(_immutable.List.of("name", "exportedName"))], [isMethod, R.always(_immutable.List.of("name", "body", "isGenerator", "params"))], [isGetter, R.always(_immutable.List.of("name", "body"))], [isSetter, R.always(_immutable.List.of("name", "body", "param"))], [isDataProperty, R.always(_immutable.List.of("name", "expression"))], [isShorthandProperty, R.always(_immutable.List.of("expression"))], [isStaticPropertyName, R.always(_immutable.List.of("value"))], [isLiteralBooleanExpression, R.always(_immutable.List.of("value"))], [isLiteralInfinityExpression, R.always((0, _immutable.List)())], [isLiteralNullExpression, R.always((0, _immutable.List)())], [isLiteralNumericExpression, R.always(_immutable.List.of("value"))], [isLiteralRegExpExpression, R.always(_immutable.List.of("pattern", "flags"))], [isLiteralStringExpression, R.always(_immutable.List.of("value"))], [isArrayExpression, R.always(_immutable.List.of("elements"))], [isArrowExpression, R.always(_immutable.List.of("params", "body"))], [isAssignmentExpression, R.always(_immutable.List.of("binding", "expression"))], [isBinaryExpression, R.always(_immutable.List.of("operator", "left", "right"))], [isCallExpression, R.always(_immutable.List.of("callee", "arguments"))], [isComputedAssignmentExpression, R.always(_immutable.List.of("operator", "binding", "expression"))], [isComputedMemberExpression, R.always(_immutable.List.of("object", "expression"))], [isConditionalExpression, R.always(_immutable.List.of("test", "consequent", "alternate"))], [isFunctionExpression, R.always(_immutable.List.of("name", "isGenerator", "params", "body"))], [isIdentifierExpression, R.always(_immutable.List.of("name"))], [isNewExpression, R.always(_immutable.List.of("callee", "arguments"))], [isNewTargetExpression, R.always((0, _immutable.List)())], [isObjectExpression, R.always(_immutable.List.of("properties"))], [isUnaryExpression, R.always(_immutable.List.of("operator", "operand"))], [isStaticMemberExpression, R.always(_immutable.List.of("object", "property"))], [isTemplateExpression, R.always(_immutable.List.of("tag", "elements"))], [isThisExpression, R.always((0, _immutable.List)())], [isUpdateExpression, R.always(_immutable.List.of("isPrefix", "operator", "operand"))], [isYieldExpression, R.always(_immutable.List.of("expression"))], [isYieldGeneratorExpression, R.always(_immutable.List.of("expression"))], [isBlockStatement, R.always(_immutable.List.of("block"))], [isBreakStatement, R.always(_immutable.List.of("label"))], [isContinueStatement, R.always(_immutable.List.of("label"))], [isCompoundAssignmentExpression, R.always(_immutable.List.of("binding", "operator", "expression"))], [isDebuggerStatement, R.always((0, _immutable.List)())], [isDoWhileStatement, R.always(_immutable.List.of("test", "body"))], [isEmptyStatement, R.always((0, _immutable.List)())], [isExpressionStatement, R.always(_immutable.List.of("expression"))], [isForInStatement, R.always(_immutable.List.of("left", "right", "body"))], [isForOfStatement, R.always(_immutable.List.of("left", "right", "body"))], [isForStatement, R.always(_immutable.List.of("init", "test", "update", "body"))], [isIfStatement, R.always(_immutable.List.of("test", "consequent", "alternate"))], [isLabeledStatement, R.always(_immutable.List.of("label", "body"))], [isReturnStatement, R.always(_immutable.List.of("expression"))], [isSwitchStatement, R.always(_immutable.List.of("discriminant", "cases"))], [isSwitchStatementWithDefault, R.always(_immutable.List.of("discriminant", "preDefaultCases", "defaultCase", "postDefaultCases"))], [isThrowStatement, R.always(_immutable.List.of("expression"))], [isTryCatchStatement, R.always(_immutable.List.of("body", "catchClause"))], [isTryFinallyStatement, R.always(_immutable.List.of("body", "catchClause", "finalizer"))], [isVariableDeclarationStatement, R.always(_immutable.List.of("declaration"))], [isWithStatement, R.always(_immutable.List.of("object", "body"))], [isWhileStatement, R.always(_immutable.List.of("test", "body"))], [isPragma, R.always(_immutable.List.of("kind", "items"))], [isBlock, R.always(_immutable.List.of("statements"))], [isCatchClause, R.always(_immutable.List.of("binding", "body"))], [isDirective, R.always(_immutable.List.of("rawValue"))], [isFormalParameters, R.always(_immutable.List.of("items", "rest"))], [isFunctionBody, R.always(_immutable.List.of("directives", "statements"))], [isFunctionDeclaration, R.always(_immutable.List.of("name", "isGenerator", "params", "body"))], [isScript, R.always(_immutable.List.of("directives", "statements"))], [isSpreadElement, R.always(_immutable.List.of("expression"))], [isSuper, R.always((0, _immutable.List)())], [isSwitchCase, R.always(_immutable.List.of("test", "consequent"))], [isSwitchDefault, R.always(_immutable.List.of("consequent"))], [isTemplateElement, R.always(_immutable.List.of("rawValue"))], [isSyntaxTemplate, R.always(_immutable.List.of("template"))], [isVariableDeclaration, R.always(_immutable.List.of("kind", "declarators"))], [isVariableDeclarator, R.always(_immutable.List.of("binding", "init"))], [isParenthesizedExpression, R.always(_immutable.List.of("inner"))], [R.T, type_1077 => (0, _errors.assert)(false, "Missing case in fields: " + type_1077.type)]]);