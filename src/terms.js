import { List } from "immutable";
import { assert, expect } from "./errors";
import { mixin } from "./utils";
import Syntax from "./syntax";
import * as R from "ramda";

export default class Term {
  constructor(type, props) {
    this.type = type;
    this.loc = null;
    for (let prop of Object.keys(props)) {
      this[prop] = props[prop];
    }
  }
  addScope(scope, bindings, options) {
    let next = {};
    for (let field of fieldsIn(this)) {
      if (this[field] == null) {
        next[field] = null;
      } else if (typeof this[field].addScope === 'function') {
        next[field] = this[field].addScope(scope, bindings, options);
      } else if (List.isList(this[field])) {
        next[field] = this[field].map(f => f.addScope(scope, bindings, options));
      } else {
        next[field] = this[field];
      }
    }
    return new Term(this.type, next);
  }
}

// bindings
export const isBindingWithDefault = R.whereEq({ type: "BindingWithDefault" });
export const isBindingIdentifier = R.whereEq({ type: "BindingIdentifier" });
export const isArrayBinding = R.whereEq({ type: "ArrayBinding" });
export const isObjectBinding = R.whereEq({ type: "ObjectBinding" });
export const isBindingPropertyIdentifier = R.whereEq({ type: "BindingPropertyIdentifier" });
export const isBindingPropertyProperty = R.whereEq({ type: "BindingPropertyIdentifier" });

// class
export const isClassExpression = R.whereEq({ type: "ClassExpression" });
export const isClassDeclaration = R.whereEq({ type: "ClassDeclaration" });
export const isClassElement = R.whereEq({ type: "ClassElement" });

// modules
export const isModule = R.whereEq({ type: "Module" });
export const isImport = R.whereEq({ type: "Import" });
export const isImportNamespace = R.whereEq({ type: "ImportNamespace" });
export const isImportSpecifier = R.whereEq({ type: "ImportSpecifier" });
export const isExportAllFrom = R.whereEq({ type: "ExportAllFrom" });
export const isExportFrom = R.whereEq({ type: "ExportFrom" });
export const isExport = R.whereEq({ type: "Export" });
export const isExportDefault = R.whereEq({ type: "ExportDefault" });
export const isExportSpecifier = R.whereEq({ type: "ExportSpecifier" });

// property definition
export const isMethod = R.whereEq({ type: "Method" });
export const isGetter = R.whereEq({ type: "Getter" });
export const isSetter = R.whereEq({ type: "Setter" });
export const isDataProperty = R.whereEq({ type: "DataProperty" });
export const isShorthandProperty = R.whereEq({ type: "ShorthandProperty" });
export const isComputedPropertyName = R.whereEq({ type: "ComputedPropertyName" });
export const isStaticPropertyName = R.whereEq({ type: "StaticPropertyName" });

// literals
export const isLiteralBooleanExpression = R.whereEq({ type: "LiteralBooleanExpression" });
export const isLiteralInfinityExpression = R.whereEq({ type: "LiteralInfinityExpression" });
export const isLiteralNullExpression = R.whereEq({ type: "LiteralNullExpression" });
export const isLiteralNumericExpression = R.whereEq({ type: "LiteralNumericExpression" });
export const isLiteralRegExpExpression = R.whereEq({ type: "LiteralRegExpExpression" });
export const isLiteralStringExpression = R.whereEq({ type: "LiteralStringExpression" });

// expressions
export const isArrayExpression = R.whereEq({ type: "ArrayExpression" });
export const isArrowExpression = R.whereEq({ type: "ArrowExpression" });
export const isAssignmentExpression = R.whereEq({ type: "AssignmentExpression" });
export const isBinaryExpression = R.whereEq({ type: "BinaryExpression" });
export const isCallExpression = R.whereEq({ type: "CallExpression" });
export const isComputedAssignmentExpression = R.whereEq({ type: "ComputedAssignmentExpression" });
export const isComputedMemberExpression = R.whereEq({ type: "ComputedMemberExpression" });
export const isConditionalExpression = R.whereEq({ type: "ConditionalExpression" });
export const isFunctionExpression = R.whereEq({ type: "FunctionExpression" });
export const isIdentifierExpression = R.whereEq({ type: "IdentifierExpression" });
export const isNewExpression = R.whereEq({ type: "NewExpression" });
export const isNewTargetExpression = R.whereEq({ type: "NewTargetExpression" });
export const isObjectExpression = R.whereEq({ type: "ObjectExpression" });
export const isUnaryExpression = R.whereEq({ type: "UnaryExpression" });
export const isStaticMemberExpression = R.whereEq({ type: "StaticMemberExpression" });
export const isTemplateExpression = R.whereEq({ type: "TemplateExpression" });
export const isThisExpression = R.whereEq({ type: "ThisExpression" });
export const isUpdateExpression = R.whereEq({ type: "UpdateExpression" });
export const isYieldExpression = R.whereEq({ type: "YieldExpression" });
export const isYieldGeneratorExpression = R.whereEq({ type: "YieldGeneratorExpression" });

// statements
export const isBlockStatement = R.whereEq({ type: "BlockStatement" });
export const isBreakStatement = R.whereEq({ type: "BreakStatement" });
export const isContinueStatement = R.whereEq({ type: "ContinueStatement" });
export const isDebuggerStatement = R.whereEq({ type: "DebuggerStatement" });
export const isDoWhileStatement = R.whereEq({ type: "DoWhileStatement" });
export const isEmptyStatement = R.whereEq({ type: "EmptyStatement" });
export const isExpressionStatement = R.whereEq({ type: "ExpressionStatement" });
export const isForInStatement = R.whereEq({ type: "ForInStatement" });
export const isForOfStatement = R.whereEq({ type: "ForOfStatement" });
export const isForStatement = R.whereEq({ type: "ForStatement" });
export const isIfStatement = R.whereEq({ type: "IfStatement" });
export const isLabeledStatement = R.whereEq({ type: "LabeledStatement" });
export const isReturnStatement = R.whereEq({ type: "ReturnStatement" });
export const isSwitchStatement = R.whereEq({ type: "SwitchStatement" });
export const isSwitchStatementWithDefault = R.whereEq({ type: "SwitchStatementWithDefault" });
export const isThrowStatement = R.whereEq({ type: "ThrowStatement" });
export const isTryCatchStatement = R.whereEq({ type: "TryCatchStatement" });
export const isTryFinallyStatement = R.whereEq({ type: "TryFinallyStatement" });
export const isVariableDeclarationStatement = R.whereEq({ type: "VariableDeclarationStatement" });
export const isWhileStatement = R.whereEq({ type: "WhileStatement" });
export const isWithStatement = R.whereEq({ type: "WithStatement" });

// other
export const isBlock = R.whereEq({ type: "Block" });
export const isCatchClause = R.whereEq({ type: "CatchClause" });
export const isDirective = R.whereEq({ type: "Directive" });
export const isFormalParameters = R.whereEq({ type: "FormalParameters" });
export const isFunctionBody = R.whereEq({ type: "FunctionBody" });
export const isFunctionDeclaration = R.whereEq({ type: "FunctionDeclaration" });
export const isScript = R.whereEq({ type: "Script" });
export const isSpreadElement = R.whereEq({ type: "SpreadElement" });
export const isSuper = R.whereEq({ type: "Super" });
export const isSwitchCase = R.whereEq({ type: "SwitchCase" });
export const isSwitchDefault = R.whereEq({ type: "SwitchDefault" });
export const isTemplateElement = R.whereEq({ type: "TemplateElement" });
export const isSyntaxTemplate = R.whereEq({ type: "SyntaxTemplate" });
export const isVariableDeclaration = R.whereEq({ type: "VariableDeclaration" });
export const isVariableDeclarator = R.whereEq({ type: "VariableDeclarator" });
export const isEOF = R.whereEq({ type: 'EOF' });
export const isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntax' }));
export const isSyntaxrecDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntaxrec' }));
export const isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
export const isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
export const isParenthesizedExpression = R.whereEq({ type: 'ParenthesizedExpression'});

const fieldsIn = R.cond([
  // bindings
  [isBindingWithDefault, R.always(List.of('binding', 'init'))],
  [isBindingIdentifier, R.always(List.of('name'))],
  [isArrayBinding, R.always(List.of('elements', 'restElement'))],
  [isObjectBinding, R.always(List.of('properties'))],
  [isBindingPropertyIdentifier, R.always(List.of('binding', 'init'))],
  [isBindingPropertyProperty, R.always(List.of('name', 'binding'))],
  // class
  [isClassExpression, R.always(List.of('name', 'super', 'elements'))],
  [isClassDeclaration, R.always(List.of('name', 'super', 'elements'))],
  [isClassElement, R.always(List.of('isStatic', 'method'))],
  // modules
  [isModule, R.always(List.of('directives', 'items'))],
  [isImport, R.always(List.of('moduleSpecifier', 'defaultBinding', 'namedImports'))],
  [isImportNamespace, R.always(List.of('moduleSpecifier', 'defaultBinding', 'namespaceBinding'))],
  [isImportSpecifier, R.always(List.of('name', 'binding'))],
  [isExportAllFrom, R.always(List.of('moduleSpecifier'))],
  [isExportFrom, R.always(List.of('namedExports', 'moduleSpecifier'))],
  [isExport, R.always(List.of('declaration'))],
  [isExportDefault, R.always(List.of('body'))],
  [isExportSpecifier, R.always(List.of('name', 'exportedName'))],
  // property definition
  [isMethod, R.always(List.of('body', 'isGenerator', 'params'))],
  [isGetter, R.always(List.of('body'))],
  [isSetter, R.always(List.of('body', 'param'))],
  [isDataProperty, R.always(List.of('name', 'expression'))],
  [isShorthandProperty, R.always(List.of('expression'))],
  [isStaticPropertyName, R.always(List.of('value'))],
  // literals
  [isLiteralBooleanExpression, R.always(List.of('value'))],
  [isLiteralInfinityExpression, R.always(List())],
  [isLiteralNullExpression, R.always(List())],
  [isLiteralNumericExpression, R.always(List.of('value'))],
  [isLiteralRegExpExpression, R.always(List.of('pattern', 'flags'))],
  [isLiteralStringExpression, R.always(List.of('value'))],
  // expressions
  [isArrayExpression, R.always(List.of('elements'))],
  [isArrowExpression, R.always(List.of('params', 'body'))],
  [isAssignmentExpression, R.always(List.of('binding', 'expression'))],
  [isBinaryExpression, R.always(List.of('operator', 'left', 'right'))],
  [isCallExpression, R.always(List.of('callee', 'arguments'))],
  [isComputedAssignmentExpression, R.always(List.of('operator', 'binding', 'expression'))],
  [isComputedMemberExpression, R.always(List.of('object', 'expression'))],
  [isConditionalExpression, R.always(List.of('test', 'consequent', 'alternate'))],
  [isFunctionExpression, R.always(List.of('name', 'isGenerator', 'params', 'body'))],
  [isIdentifierExpression, R.always(List.of('name'))],
  [isNewExpression, R.always(List.of('callee', 'arguments'))],
  [isNewTargetExpression, R.always(List())],
  [isObjectExpression, R.always(List.of('properties'))],
  [isUnaryExpression, R.always(List.of('operator', 'operand'))],
  [isStaticMemberExpression, R.always(List.of('object', 'property'))],
  [isTemplateExpression, R.always(List.of('tag', 'elements'))],
  [isThisExpression, R.always(List())],
  [isYieldExpression, R.always(List.of('expression'))],
  [isYieldGeneratorExpression, R.always(List.of('expression'))],
  // statements
  [isBlockStatement, R.always(List.of('block'))],
  [isBreakStatement, R.always(List.of('label'))],
  [isContinueStatement, R.always(List.of('label'))],
  [isDebuggerStatement, R.always(List())],
  [isDoWhileStatement, R.always(List.of('test', 'body'))],
  [isEmptyStatement, R.always(List())],
  [isExpressionStatement, R.always(List.of('expression'))],
  [isForInStatement, R.always(List.of('left', 'right', 'body'))],
  [isForOfStatement, R.always(List.of('left', 'right', 'body'))],
  [isForStatement, R.always(List.of('init', 'test', 'update', 'body'))],
  [isLabeledStatement, R.always(List.of('label', 'body'))],
  [isReturnStatement, R.always(List.of('expression'))],
  [isSwitchStatementWithDefault, R.always(List.of('discriminant', 'preDefaultCases', 'defaultCase', 'postDefaultCases'))],
  [isThrowStatement, R.always(List.of('expression'))],
  [isTryCatchStatement, R.always(List.of('body', 'catchClause'))],
  [isTryFinallyStatement, R.always(List.of('body', 'catchClause', 'finalizer'))],
  [isVariableDeclarationStatement, R.always(List.of('declaration'))],
  [isWithStatement, R.always(List.of('object', 'body'))],
  // other
  [isBlock, R.always(List.of('statements'))],
  [isCatchClause, R.always(List.of('binding', 'body'))],
  [isDirective, R.always(List.of('rawValue'))],
  [isFormalParameters, R.always(List.of('items', 'rest'))],
  [isFunctionBody, R.always(List.of('directives', 'statements'))],
  [isFunctionDeclaration, R.always(List.of('name', 'isGenerator', 'params', 'body'))],
  [isScript, R.always(List.of('directives', 'statements'))],
  [isSpreadElement, R.always(List.of('expression'))],
  [isSuper, R.always(List())],
  [isSwitchCase, R.always(List.of('test', 'consequent'))],
  [isSwitchDefault, R.always(List.of('consequent'))],
  [isTemplateElement, R.always(List.of('rawValue'))],
  [isSyntaxTemplate, R.always(List.of('template'))],
  [isVariableDeclaration, R.always(List.of('kind', 'declarators'))],
  [isVariableDeclarator, R.always(List.of('binding', 'init'))],
  [isParenthesizedExpression, R.always(List.of('inner'))],

  [R.T, type => assert(false, 'Missing case in fields: ' + type.type)]
]);
