"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImportDeclaration = exports.isCompiletimeStatement = exports.isCompiletimeDeclaration = exports.isSyntaxDeclarationStatement = exports.isExportSyntax = exports.isParenthesizedExpression = exports.isFunctionWithName = exports.isFunctionTerm = exports.isSyntaxrecDeclaration = exports.isSyntaxDeclaration = exports.isEOF = exports.isVariableDeclarator = exports.isVariableDeclaration = exports.isSyntaxTemplate = exports.isTemplateElement = exports.isSwitchDefault = exports.isSwitchCase = exports.isSuper = exports.isSpreadElement = exports.isScript = exports.isFunctionDeclaration = exports.isFunctionBody = exports.isFormalParameters = exports.isDirective = exports.isCatchClause = exports.isBlock = exports.isPragma = exports.isWithStatement = exports.isWhileStatement = exports.isVariableDeclarationStatement = exports.isTryFinallyStatement = exports.isTryCatchStatement = exports.isThrowStatement = exports.isSwitchStatementWithDefault = exports.isSwitchStatement = exports.isReturnStatement = exports.isLabeledStatement = exports.isIfStatement = exports.isForStatement = exports.isForOfStatement = exports.isForInStatement = exports.isExpressionStatement = exports.isEmptyStatement = exports.isDoWhileStatement = exports.isDebuggerStatement = exports.isCompoundAssignmentExpression = exports.isContinueStatement = exports.isBreakStatement = exports.isBlockStatement = exports.isYieldGeneratorExpression = exports.isYieldExpression = exports.isUpdateExpression = exports.isThisExpression = exports.isTemplateExpression = exports.isStaticMemberExpression = exports.isUnaryExpression = exports.isObjectExpression = exports.isNewTargetExpression = exports.isNewExpression = exports.isIdentifierExpression = exports.isFunctionExpression = exports.isConditionalExpression = exports.isComputedMemberExpression = exports.isComputedAssignmentExpression = exports.isCallExpression = exports.isBinaryExpression = exports.isAssignmentExpression = exports.isArrowExpression = exports.isArrayExpression = exports.isLiteralStringExpression = exports.isLiteralRegExpExpression = exports.isLiteralNumericExpression = exports.isLiteralNullExpression = exports.isLiteralInfinityExpression = exports.isLiteralBooleanExpression = exports.isStaticPropertyName = exports.isComputedPropertyName = exports.isShorthandProperty = exports.isDataProperty = exports.isSetter = exports.isGetter = exports.isMethod = exports.isExportSpecifier = exports.isExportDefault = exports.isExport = exports.isExportFrom = exports.isExportAllFrom = exports.isImportSpecifier = exports.isImportNamespace = exports.isImport = exports.isModule = exports.isClassElement = exports.isClassDeclaration = exports.isClassExpression = exports.isBindingPropertyProperty = exports.isBindingPropertyIdentifier = exports.isObjectBinding = exports.isArrayBinding = exports.isBindingIdentifier = exports.isBindingWithDefault = undefined;

var _immutable = require("immutable");

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

var _sweetSpec = require("sweet-spec");

var _sweetSpec2 = _interopRequireDefault(_sweetSpec);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const attrName = a => a.attrName;

class Term {

  constructor(type, props) {
    let spec = _sweetSpec2.default.getDescendant(type);
    if (spec == null) {
      throw new Error(`Unknown term: ${ type }`);
    }
    this.type = type;
    this.loc = null;
    this.spec = spec;
    let propKeys = Object.keys(props);
    let fieldNames = spec.getAttributes().map(attrName);
    let diff = R.symmetricDifference(propKeys, fieldNames);
    if (diff.length !== 0) {
      throw new Error(`Unexpected properties for term ${ type }: ${ diff }`);
    }
    Object.assign(this, props);
  }

  extend(props) {
    let specAttrNames = this.spec.getAttributes().map(attrName);
    let newProps = R.pick(specAttrNames, this);

    let invalidAttrs = R.difference(Object.keys(props), specAttrNames);
    if (invalidAttrs.length > 0) {
      throw new Error(`Unexpected properties for term ${ this.type }: ${ invalidAttrs }`);
    }

    return new Term(this.type, Object.assign(newProps, props));
  }

  // TODO: remove
  gen() {
    let includeImports = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    let next = {};
    for (let field of this.spec.getAttributes()) {
      if (this[field.attrName] == null) {
        next[field.attrName] = null;
      } else if (this[field.attrName] instanceof Term) {
        next[field.attrName] = this[field.attrName].gen(includeImports);
      } else if (_immutable.List.isList(this[field.attrName])) {
        let pred = includeImports ? R.complement(isCompiletimeStatement) : R.both(R.complement(isImportDeclaration), R.complement(isCompiletimeStatement));
        next[field.attrName] = this[field.attrName].filter(pred).map(term => term instanceof Term ? term.gen(includeImports) : term);
      } else {
        next[field.attrName] = this[field.attrName];
      }
    }
    return new Term(this.type, next);
  }

  // TODO: remove
  visit(f) {
    let next = {};
    for (let field of _sweetSpec2.default.getDescendant(this.type).getAttributes()) {
      if (this[field.attrName] == null) {
        next[field.attrName] = null;
      } else if (_immutable.List.isList(this[field.attrName])) {
        next[field.attrName] = this[field.attrName].map(field => field != null ? f(field) : null);
      } else {
        next[field.attrName] = f(this[field.attrName]);
      }
    }
    return this.extend(next);
  }

  // TODO: remove
  addScope(scope, bindings, phase, options) {
    return this.visit(term => {
      if (typeof term.addScope === 'function') {
        return term.addScope(scope, bindings, phase, options);
      }
      return term;
    });
  }

  // TODO: remove
  removeScope(scope, phase) {
    return this.visit(term => {
      if (typeof term.removeScope === 'function') {
        return term.removeScope(scope, phase);
      }
      return term;
    });
  }

  // TODO: this is very wrong
  lineNumber() {
    for (let field of _sweetSpec2.default.getDescendant(this.type).getAttributes()) {
      if (typeof this[field.attrName] && this[field.attrName].lineNumber === 'function') {
        return this[field.attrName].lineNumber();
      }
    }
  }

  setLineNumber(line) {
    let next = {};
    for (let field of _sweetSpec2.default.getDescendant(this.type).getAttributes()) {
      if (this[field.attrName] == null) {
        next[field.attrName] = null;
      } else if (typeof this[field.attrName].setLineNumber === 'function') {
        next[field.attrName] = this[field.attrName].setLineNumber(line);
      } else if (_immutable.List.isList(this[field.attrName])) {
        next[field.attrName] = this[field.attrName].map(f => f.setLineNumber(line));
      } else {
        next[field.attrName] = this[field.attrName];
      }
    }
    return new Term(this.type, next);
  }
}

exports.default = Term; // bindings

const isBindingWithDefault = exports.isBindingWithDefault = R.whereEq({ type: "BindingWithDefault" });
const isBindingIdentifier = exports.isBindingIdentifier = R.whereEq({ type: "BindingIdentifier" });
const isArrayBinding = exports.isArrayBinding = R.whereEq({ type: "ArrayBinding" });
const isObjectBinding = exports.isObjectBinding = R.whereEq({ type: "ObjectBinding" });
const isBindingPropertyIdentifier = exports.isBindingPropertyIdentifier = R.whereEq({ type: "BindingPropertyIdentifier" });
const isBindingPropertyProperty = exports.isBindingPropertyProperty = R.whereEq({ type: "BindingPropertyIdentifier" });

// class
const isClassExpression = exports.isClassExpression = R.whereEq({ type: "ClassExpression" });
const isClassDeclaration = exports.isClassDeclaration = R.whereEq({ type: "ClassDeclaration" });
const isClassElement = exports.isClassElement = R.whereEq({ type: "ClassElement" });

// modules
const isModule = exports.isModule = R.whereEq({ type: "Module" });
const isImport = exports.isImport = R.whereEq({ type: "Import" });
const isImportNamespace = exports.isImportNamespace = R.whereEq({ type: "ImportNamespace" });
const isImportSpecifier = exports.isImportSpecifier = R.whereEq({ type: "ImportSpecifier" });
const isExportAllFrom = exports.isExportAllFrom = R.whereEq({ type: "ExportAllFrom" });
const isExportFrom = exports.isExportFrom = R.whereEq({ type: "ExportFrom" });
const isExport = exports.isExport = R.whereEq({ type: "Export" });
const isExportDefault = exports.isExportDefault = R.whereEq({ type: "ExportDefault" });
const isExportSpecifier = exports.isExportSpecifier = R.whereEq({ type: "ExportSpecifier" });

// property definition
const isMethod = exports.isMethod = R.whereEq({ type: "Method" });
const isGetter = exports.isGetter = R.whereEq({ type: "Getter" });
const isSetter = exports.isSetter = R.whereEq({ type: "Setter" });
const isDataProperty = exports.isDataProperty = R.whereEq({ type: "DataProperty" });
const isShorthandProperty = exports.isShorthandProperty = R.whereEq({ type: "ShorthandProperty" });
const isComputedPropertyName = exports.isComputedPropertyName = R.whereEq({ type: "ComputedPropertyName" });
const isStaticPropertyName = exports.isStaticPropertyName = R.whereEq({ type: "StaticPropertyName" });

// literals
const isLiteralBooleanExpression = exports.isLiteralBooleanExpression = R.whereEq({ type: "LiteralBooleanExpression" });
const isLiteralInfinityExpression = exports.isLiteralInfinityExpression = R.whereEq({ type: "LiteralInfinityExpression" });
const isLiteralNullExpression = exports.isLiteralNullExpression = R.whereEq({ type: "LiteralNullExpression" });
const isLiteralNumericExpression = exports.isLiteralNumericExpression = R.whereEq({ type: "LiteralNumericExpression" });
const isLiteralRegExpExpression = exports.isLiteralRegExpExpression = R.whereEq({ type: "LiteralRegExpExpression" });
const isLiteralStringExpression = exports.isLiteralStringExpression = R.whereEq({ type: "LiteralStringExpression" });

// expressions
const isArrayExpression = exports.isArrayExpression = R.whereEq({ type: "ArrayExpression" });
const isArrowExpression = exports.isArrowExpression = R.whereEq({ type: "ArrowExpression" });
const isAssignmentExpression = exports.isAssignmentExpression = R.whereEq({ type: "AssignmentExpression" });
const isBinaryExpression = exports.isBinaryExpression = R.whereEq({ type: "BinaryExpression" });
const isCallExpression = exports.isCallExpression = R.whereEq({ type: "CallExpression" });
const isComputedAssignmentExpression = exports.isComputedAssignmentExpression = R.whereEq({ type: "ComputedAssignmentExpression" });
const isComputedMemberExpression = exports.isComputedMemberExpression = R.whereEq({ type: "ComputedMemberExpression" });
const isConditionalExpression = exports.isConditionalExpression = R.whereEq({ type: "ConditionalExpression" });
const isFunctionExpression = exports.isFunctionExpression = R.whereEq({ type: "FunctionExpression" });
const isIdentifierExpression = exports.isIdentifierExpression = R.whereEq({ type: "IdentifierExpression" });
const isNewExpression = exports.isNewExpression = R.whereEq({ type: "NewExpression" });
const isNewTargetExpression = exports.isNewTargetExpression = R.whereEq({ type: "NewTargetExpression" });
const isObjectExpression = exports.isObjectExpression = R.whereEq({ type: "ObjectExpression" });
const isUnaryExpression = exports.isUnaryExpression = R.whereEq({ type: "UnaryExpression" });
const isStaticMemberExpression = exports.isStaticMemberExpression = R.whereEq({ type: "StaticMemberExpression" });
const isTemplateExpression = exports.isTemplateExpression = R.whereEq({ type: "TemplateExpression" });
const isThisExpression = exports.isThisExpression = R.whereEq({ type: "ThisExpression" });
const isUpdateExpression = exports.isUpdateExpression = R.whereEq({ type: "UpdateExpression" });
const isYieldExpression = exports.isYieldExpression = R.whereEq({ type: "YieldExpression" });
const isYieldGeneratorExpression = exports.isYieldGeneratorExpression = R.whereEq({ type: "YieldGeneratorExpression" });

// statements
const isBlockStatement = exports.isBlockStatement = R.whereEq({ type: "BlockStatement" });
const isBreakStatement = exports.isBreakStatement = R.whereEq({ type: "BreakStatement" });
const isContinueStatement = exports.isContinueStatement = R.whereEq({ type: "ContinueStatement" });
const isCompoundAssignmentExpression = exports.isCompoundAssignmentExpression = R.whereEq({ type: "CompoundAssignmentExpression" });
const isDebuggerStatement = exports.isDebuggerStatement = R.whereEq({ type: "DebuggerStatement" });
const isDoWhileStatement = exports.isDoWhileStatement = R.whereEq({ type: "DoWhileStatement" });
const isEmptyStatement = exports.isEmptyStatement = R.whereEq({ type: "EmptyStatement" });
const isExpressionStatement = exports.isExpressionStatement = R.whereEq({ type: "ExpressionStatement" });
const isForInStatement = exports.isForInStatement = R.whereEq({ type: "ForInStatement" });
const isForOfStatement = exports.isForOfStatement = R.whereEq({ type: "ForOfStatement" });
const isForStatement = exports.isForStatement = R.whereEq({ type: "ForStatement" });
const isIfStatement = exports.isIfStatement = R.whereEq({ type: "IfStatement" });
const isLabeledStatement = exports.isLabeledStatement = R.whereEq({ type: "LabeledStatement" });
const isReturnStatement = exports.isReturnStatement = R.whereEq({ type: "ReturnStatement" });
const isSwitchStatement = exports.isSwitchStatement = R.whereEq({ type: "SwitchStatement" });
const isSwitchStatementWithDefault = exports.isSwitchStatementWithDefault = R.whereEq({ type: "SwitchStatementWithDefault" });
const isThrowStatement = exports.isThrowStatement = R.whereEq({ type: "ThrowStatement" });
const isTryCatchStatement = exports.isTryCatchStatement = R.whereEq({ type: "TryCatchStatement" });
const isTryFinallyStatement = exports.isTryFinallyStatement = R.whereEq({ type: "TryFinallyStatement" });
const isVariableDeclarationStatement = exports.isVariableDeclarationStatement = R.whereEq({ type: "VariableDeclarationStatement" });
const isWhileStatement = exports.isWhileStatement = R.whereEq({ type: "WhileStatement" });
const isWithStatement = exports.isWithStatement = R.whereEq({ type: "WithStatement" });

// other
const isPragma = exports.isPragma = R.whereEq({ type: 'Pragma' });
const isBlock = exports.isBlock = R.whereEq({ type: "Block" });
const isCatchClause = exports.isCatchClause = R.whereEq({ type: "CatchClause" });
const isDirective = exports.isDirective = R.whereEq({ type: "Directive" });
const isFormalParameters = exports.isFormalParameters = R.whereEq({ type: "FormalParameters" });
const isFunctionBody = exports.isFunctionBody = R.whereEq({ type: "FunctionBody" });
const isFunctionDeclaration = exports.isFunctionDeclaration = R.whereEq({ type: "FunctionDeclaration" });
const isScript = exports.isScript = R.whereEq({ type: "Script" });
const isSpreadElement = exports.isSpreadElement = R.whereEq({ type: "SpreadElement" });
const isSuper = exports.isSuper = R.whereEq({ type: "Super" });
const isSwitchCase = exports.isSwitchCase = R.whereEq({ type: "SwitchCase" });
const isSwitchDefault = exports.isSwitchDefault = R.whereEq({ type: "SwitchDefault" });
const isTemplateElement = exports.isTemplateElement = R.whereEq({ type: "TemplateElement" });
const isSyntaxTemplate = exports.isSyntaxTemplate = R.whereEq({ type: "SyntaxTemplate" });
const isVariableDeclaration = exports.isVariableDeclaration = R.whereEq({ type: "VariableDeclaration" });
const isVariableDeclarator = exports.isVariableDeclarator = R.whereEq({ type: "VariableDeclarator" });
const isEOF = exports.isEOF = R.whereEq({ type: 'EOF' });
const isSyntaxDeclaration = exports.isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntax' }));
const isSyntaxrecDeclaration = exports.isSyntaxrecDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntaxrec' }));
const isFunctionTerm = exports.isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
const isFunctionWithName = exports.isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
const isParenthesizedExpression = exports.isParenthesizedExpression = R.whereEq({ type: 'ParenthesizedExpression' });
const isExportSyntax = exports.isExportSyntax = R.both(isExport, exp => R.or(isSyntaxDeclaration(exp.declaration), isSyntaxrecDeclaration(exp.declaration)));
const isSyntaxDeclarationStatement = exports.isSyntaxDeclarationStatement = R.both(isVariableDeclarationStatement, decl => isCompiletimeDeclaration(decl.declaration));

const isCompiletimeDeclaration = exports.isCompiletimeDeclaration = R.either(isSyntaxDeclaration, isSyntaxrecDeclaration);
const isCompiletimeStatement = exports.isCompiletimeStatement = term => {
  return term instanceof Term && isVariableDeclarationStatement(term) && isCompiletimeDeclaration(term.declaration);
};
const isImportDeclaration = exports.isImportDeclaration = R.either(isImport, isImportNamespace);
//# sourceMappingURL=data:application/json;base64,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LEVBQW1CLGlCQUFuQixDQUE1QiIsImZpbGUiOiJ0ZXJtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpc3QgfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm1TcGVjIGZyb20gJ3N3ZWV0LXNwZWMnO1xuXG5jb25zdCBhdHRyTmFtZSA9IGEgPT4gYS5hdHRyTmFtZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybSB7XG4gIHR5cGU6IHN0cmluZztcbiAgbG9jOiBudWxsO1xuICBzcGVjOiB0eXBlb2YgVGVybVNwZWM7XG5cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBwcm9wczoge30pIHtcbiAgICBsZXQgc3BlYyA9IFRlcm1TcGVjLmdldERlc2NlbmRhbnQodHlwZSk7XG4gICAgaWYgKHNwZWMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRlcm06ICR7dHlwZX1gKTtcbiAgICB9XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmxvYyA9IG51bGw7XG4gICAgdGhpcy5zcGVjID0gc3BlYztcbiAgICBsZXQgcHJvcEtleXMgPSBPYmplY3Qua2V5cyhwcm9wcyk7XG4gICAgbGV0IGZpZWxkTmFtZXMgPSBzcGVjLmdldEF0dHJpYnV0ZXMoKS5tYXAoYXR0ck5hbWUpO1xuICAgIGxldCBkaWZmID0gUi5zeW1tZXRyaWNEaWZmZXJlbmNlKHByb3BLZXlzLCBmaWVsZE5hbWVzKTtcbiAgICBpZiAoZGlmZi5sZW5ndGggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBwcm9wZXJ0aWVzIGZvciB0ZXJtICR7dHlwZX06ICR7ZGlmZn1gKTtcbiAgICB9XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG4gIH1cblxuICBleHRlbmQocHJvcHM6IHt9KSB7XG4gICAgbGV0IHNwZWNBdHRyTmFtZXMgPSB0aGlzLnNwZWMuZ2V0QXR0cmlidXRlcygpLm1hcChhdHRyTmFtZSk7XG4gICAgbGV0IG5ld1Byb3BzID0gUi5waWNrKHNwZWNBdHRyTmFtZXMsIHRoaXMpO1xuXG4gICAgbGV0IGludmFsaWRBdHRycyA9IFIuZGlmZmVyZW5jZShPYmplY3Qua2V5cyhwcm9wcyksIHNwZWNBdHRyTmFtZXMpO1xuICAgIGlmIChpbnZhbGlkQXR0cnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHByb3BlcnRpZXMgZm9yIHRlcm0gJHt0aGlzLnR5cGV9OiAke2ludmFsaWRBdHRyc31gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBPYmplY3QuYXNzaWduKG5ld1Byb3BzLCBwcm9wcykpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVtb3ZlXG4gIGdlbihpbmNsdWRlSW1wb3J0czogYm9vbGVhbiA9IHRydWUpIHtcbiAgICBsZXQgbmV4dCA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIHRoaXMuc3BlYy5nZXRBdHRyaWJ1dGVzKCkpIHtcbiAgICAgIGlmICh0aGlzW2ZpZWxkLmF0dHJOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIG5leHRbZmllbGQuYXR0ck5hbWVdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpc1tmaWVsZC5hdHRyTmFtZV0gaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICAgIG5leHRbZmllbGQuYXR0ck5hbWVdID0gdGhpc1tmaWVsZC5hdHRyTmFtZV0uZ2VuKGluY2x1ZGVJbXBvcnRzKTtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodGhpc1tmaWVsZC5hdHRyTmFtZV0pKSB7XG4gICAgICAgIGxldCBwcmVkID0gaW5jbHVkZUltcG9ydHMgPyBSLmNvbXBsZW1lbnQoaXNDb21waWxldGltZVN0YXRlbWVudCkgOiBSLmJvdGgoUi5jb21wbGVtZW50KGlzSW1wb3J0RGVjbGFyYXRpb24pLCBSLmNvbXBsZW1lbnQoaXNDb21waWxldGltZVN0YXRlbWVudCkpO1xuICAgICAgICBuZXh0W2ZpZWxkLmF0dHJOYW1lXSA9IHRoaXNbZmllbGQuYXR0ck5hbWVdLmZpbHRlcihwcmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0ZXJtID0+IHRlcm0gaW5zdGFuY2VvZiBUZXJtID8gdGVybS5nZW4oaW5jbHVkZUltcG9ydHMpIDogdGVybSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0W2ZpZWxkLmF0dHJOYW1lXSA9IHRoaXNbZmllbGQuYXR0ck5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBuZXh0KTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbW92ZVxuICB2aXNpdChmKSB7XG4gICAgbGV0IG5leHQgPSB7fTtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5nZXREZXNjZW5kYW50KHRoaXMudHlwZSkuZ2V0QXR0cmlidXRlcygpKSB7XG4gICAgICBpZiAodGhpc1tmaWVsZC5hdHRyTmFtZV0gPT0gbnVsbCkge1xuICAgICAgICBuZXh0W2ZpZWxkLmF0dHJOYW1lXSA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKExpc3QuaXNMaXN0KHRoaXNbZmllbGQuYXR0ck5hbWVdKSkge1xuICAgICAgICBuZXh0W2ZpZWxkLmF0dHJOYW1lXSA9IHRoaXNbZmllbGQuYXR0ck5hbWVdLm1hcChmaWVsZCA9PiBmaWVsZCAhPSBudWxsID8gZihmaWVsZCkgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRbZmllbGQuYXR0ck5hbWVdID0gZih0aGlzW2ZpZWxkLmF0dHJOYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4dGVuZChuZXh0KTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbW92ZVxuICBhZGRTY29wZShzY29wZSwgYmluZGluZ3MsIHBoYXNlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXQodGVybSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRlcm0uYWRkU2NvcGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRlcm0uYWRkU2NvcGUoc2NvcGUsIGJpbmRpbmdzLCBwaGFzZSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbW92ZVxuICByZW1vdmVTY29wZShzY29wZSwgcGhhc2UpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh0ZXJtID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdGVybS5yZW1vdmVTY29wZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdGVybS5yZW1vdmVTY29wZShzY29wZSwgcGhhc2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlcm07XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiB0aGlzIGlzIHZlcnkgd3JvbmdcbiAgbGluZU51bWJlcigpIHtcbiAgICBmb3IgKGxldCBmaWVsZCBvZiBUZXJtU3BlYy5nZXREZXNjZW5kYW50KHRoaXMudHlwZSkuZ2V0QXR0cmlidXRlcygpKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbZmllbGQuYXR0ck5hbWVdICYmIHRoaXNbZmllbGQuYXR0ck5hbWVdLmxpbmVOdW1iZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbZmllbGQuYXR0ck5hbWVdLmxpbmVOdW1iZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRMaW5lTnVtYmVyKGxpbmUpIHtcbiAgICBsZXQgbmV4dCA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIFRlcm1TcGVjLmdldERlc2NlbmRhbnQodGhpcy50eXBlKS5nZXRBdHRyaWJ1dGVzKCkpIHtcbiAgICAgIGlmICh0aGlzW2ZpZWxkLmF0dHJOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIG5leHRbZmllbGQuYXR0ck5hbWVdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXNbZmllbGQuYXR0ck5hbWVdLnNldExpbmVOdW1iZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbmV4dFtmaWVsZC5hdHRyTmFtZV0gPSB0aGlzW2ZpZWxkLmF0dHJOYW1lXS5zZXRMaW5lTnVtYmVyKGxpbmUpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0LmlzTGlzdCh0aGlzW2ZpZWxkLmF0dHJOYW1lXSkpIHtcbiAgICAgICAgbmV4dFtmaWVsZC5hdHRyTmFtZV0gPSB0aGlzW2ZpZWxkLmF0dHJOYW1lXS5tYXAoZiA9PiBmLnNldExpbmVOdW1iZXIobGluZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dFtmaWVsZC5hdHRyTmFtZV0gPSB0aGlzW2ZpZWxkLmF0dHJOYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHRoaXMudHlwZSwgbmV4dCk7XG4gIH1cbn1cblxuXG4vLyBiaW5kaW5nc1xuZXhwb3J0IGNvbnN0IGlzQmluZGluZ1dpdGhEZWZhdWx0ID0gUi53aGVyZUVxKHsgdHlwZTogXCJCaW5kaW5nV2l0aERlZmF1bHRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0JpbmRpbmdJZGVudGlmaWVyID0gUi53aGVyZUVxKHsgdHlwZTogXCJCaW5kaW5nSWRlbnRpZmllclwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQXJyYXlCaW5kaW5nID0gUi53aGVyZUVxKHsgdHlwZTogXCJBcnJheUJpbmRpbmdcIiB9KTtcbmV4cG9ydCBjb25zdCBpc09iamVjdEJpbmRpbmcgPSBSLndoZXJlRXEoeyB0eXBlOiBcIk9iamVjdEJpbmRpbmdcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5ID0gUi53aGVyZUVxKHsgdHlwZTogXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIgfSk7XG5cbi8vIGNsYXNzXG5leHBvcnQgY29uc3QgaXNDbGFzc0V4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkNsYXNzRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQ2xhc3NEZWNsYXJhdGlvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ2xhc3NEZWNsYXJhdGlvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQ2xhc3NFbGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJDbGFzc0VsZW1lbnRcIiB9KTtcblxuLy8gbW9kdWxlc1xuZXhwb3J0IGNvbnN0IGlzTW9kdWxlID0gUi53aGVyZUVxKHsgdHlwZTogXCJNb2R1bGVcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0ltcG9ydCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiSW1wb3J0XCIgfSk7XG5leHBvcnQgY29uc3QgaXNJbXBvcnROYW1lc3BhY2UgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkltcG9ydE5hbWVzcGFjZVwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzSW1wb3J0U3BlY2lmaWVyID0gUi53aGVyZUVxKHsgdHlwZTogXCJJbXBvcnRTcGVjaWZpZXJcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0V4cG9ydEFsbEZyb20gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkV4cG9ydEFsbEZyb21cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0V4cG9ydEZyb20gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkV4cG9ydEZyb21cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0V4cG9ydCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiRXhwb3J0XCIgfSk7XG5leHBvcnQgY29uc3QgaXNFeHBvcnREZWZhdWx0ID0gUi53aGVyZUVxKHsgdHlwZTogXCJFeHBvcnREZWZhdWx0XCIgfSk7XG5leHBvcnQgY29uc3QgaXNFeHBvcnRTcGVjaWZpZXIgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkV4cG9ydFNwZWNpZmllclwiIH0pO1xuXG4vLyBwcm9wZXJ0eSBkZWZpbml0aW9uXG5leHBvcnQgY29uc3QgaXNNZXRob2QgPSBSLndoZXJlRXEoeyB0eXBlOiBcIk1ldGhvZFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzR2V0dGVyID0gUi53aGVyZUVxKHsgdHlwZTogXCJHZXR0ZXJcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1NldHRlciA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU2V0dGVyXCIgfSk7XG5leHBvcnQgY29uc3QgaXNEYXRhUHJvcGVydHkgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkRhdGFQcm9wZXJ0eVwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzU2hvcnRoYW5kUHJvcGVydHkgPSBSLndoZXJlRXEoeyB0eXBlOiBcIlNob3J0aGFuZFByb3BlcnR5XCIgfSk7XG5leHBvcnQgY29uc3QgaXNDb21wdXRlZFByb3BlcnR5TmFtZSA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1N0YXRpY1Byb3BlcnR5TmFtZSA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3RhdGljUHJvcGVydHlOYW1lXCIgfSk7XG5cbi8vIGxpdGVyYWxzXG5leHBvcnQgY29uc3QgaXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzTGl0ZXJhbE51bGxFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJMaXRlcmFsTnVsbEV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0xpdGVyYWxOdW1lcmljRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0xpdGVyYWxTdHJpbmdFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiIH0pO1xuXG4vLyBleHByZXNzaW9uc1xuZXhwb3J0IGNvbnN0IGlzQXJyYXlFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJBcnJheUV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0Fycm93RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQXJyb3dFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNBc3NpZ25tZW50RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0JpbmFyeUV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0NhbGxFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJDYWxsRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0NvbmRpdGlvbmFsRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbkV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzSWRlbnRpZmllckV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIklkZW50aWZpZXJFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNOZXdFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJOZXdFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNOZXdUYXJnZXRFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJOZXdUYXJnZXRFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNPYmplY3RFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJPYmplY3RFeHByZXNzaW9uXCIgfSk7XG5leHBvcnQgY29uc3QgaXNVbmFyeUV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc1RoaXNFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJUaGlzRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVXBkYXRlRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiVXBkYXRlRXhwcmVzc2lvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzWWllbGRFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogXCJZaWVsZEV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc1lpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIgfSk7XG5cbi8vIHN0YXRlbWVudHNcbmV4cG9ydCBjb25zdCBpc0Jsb2NrU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJCbG9ja1N0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzQnJlYWtTdGF0ZW1lbnQgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkJyZWFrU3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNDb250aW51ZVN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ29udGludWVTdGF0ZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0NvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24gPSBSLndoZXJlRXEoeyB0eXBlOiBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiB9KTtcbmV4cG9ydCBjb25zdCBpc0RlYnVnZ2VyU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJEZWJ1Z2dlclN0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzRG9XaGlsZVN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiRG9XaGlsZVN0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzRW1wdHlTdGF0ZW1lbnQgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkVtcHR5U3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNFeHByZXNzaW9uU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJFeHByZXNzaW9uU3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNGb3JJblN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiRm9ySW5TdGF0ZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0Zvck9mU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJGb3JPZlN0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzRm9yU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJGb3JTdGF0ZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0lmU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJJZlN0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzTGFiZWxlZFN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiTGFiZWxlZFN0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzUmV0dXJuU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJSZXR1cm5TdGF0ZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1N3aXRjaFN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3dpdGNoU3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1Rocm93U3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJUaHJvd1N0YXRlbWVudFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVHJ5Q2F0Y2hTdGF0ZW1lbnQgPSBSLndoZXJlRXEoeyB0eXBlOiBcIlRyeUNhdGNoU3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNUcnlGaW5hbGx5U3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIgfSk7XG5leHBvcnQgY29uc3QgaXNXaGlsZVN0YXRlbWVudCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiV2hpbGVTdGF0ZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1dpdGhTdGF0ZW1lbnQgPSBSLndoZXJlRXEoeyB0eXBlOiBcIldpdGhTdGF0ZW1lbnRcIiB9KTtcblxuLy8gb3RoZXJcbmV4cG9ydCBjb25zdCBpc1ByYWdtYSA9IFIud2hlcmVFcSh7IHR5cGU6ICdQcmFnbWEnIH0pO1xuZXhwb3J0IGNvbnN0IGlzQmxvY2sgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkJsb2NrXCIgfSk7XG5leHBvcnQgY29uc3QgaXNDYXRjaENsYXVzZSA9IFIud2hlcmVFcSh7IHR5cGU6IFwiQ2F0Y2hDbGF1c2VcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZSA9IFIud2hlcmVFcSh7IHR5cGU6IFwiRGlyZWN0aXZlXCIgfSk7XG5leHBvcnQgY29uc3QgaXNGb3JtYWxQYXJhbWV0ZXJzID0gUi53aGVyZUVxKHsgdHlwZTogXCJGb3JtYWxQYXJhbWV0ZXJzXCIgfSk7XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbkJvZHkgPSBSLndoZXJlRXEoeyB0eXBlOiBcIkZ1bmN0aW9uQm9keVwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzRnVuY3Rpb25EZWNsYXJhdGlvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzU2NyaXB0ID0gUi53aGVyZUVxKHsgdHlwZTogXCJTY3JpcHRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1NwcmVhZEVsZW1lbnQgPSBSLndoZXJlRXEoeyB0eXBlOiBcIlNwcmVhZEVsZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1N1cGVyID0gUi53aGVyZUVxKHsgdHlwZTogXCJTdXBlclwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzU3dpdGNoQ2FzZSA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3dpdGNoQ2FzZVwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzU3dpdGNoRGVmYXVsdCA9IFIud2hlcmVFcSh7IHR5cGU6IFwiU3dpdGNoRGVmYXVsdFwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVFbGVtZW50ID0gUi53aGVyZUVxKHsgdHlwZTogXCJUZW1wbGF0ZUVsZW1lbnRcIiB9KTtcbmV4cG9ydCBjb25zdCBpc1N5bnRheFRlbXBsYXRlID0gUi53aGVyZUVxKHsgdHlwZTogXCJTeW50YXhUZW1wbGF0ZVwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvbiA9IFIud2hlcmVFcSh7IHR5cGU6IFwiVmFyaWFibGVEZWNsYXJhdGlvblwiIH0pO1xuZXhwb3J0IGNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdG9yID0gUi53aGVyZUVxKHsgdHlwZTogXCJWYXJpYWJsZURlY2xhcmF0b3JcIiB9KTtcbmV4cG9ydCBjb25zdCBpc0VPRiA9IFIud2hlcmVFcSh7IHR5cGU6ICdFT0YnIH0pO1xuZXhwb3J0IGNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb24gPSBSLmJvdGgoaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBSLndoZXJlRXEoeyBraW5kOiAnc3ludGF4JyB9KSk7XG5leHBvcnQgY29uc3QgaXNTeW50YXhyZWNEZWNsYXJhdGlvbiA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIFIud2hlcmVFcSh7IGtpbmQ6ICdzeW50YXhyZWMnIH0pKTtcbmV4cG9ydCBjb25zdCBpc0Z1bmN0aW9uVGVybSA9IFIuZWl0aGVyKGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24pO1xuZXhwb3J0IGNvbnN0IGlzRnVuY3Rpb25XaXRoTmFtZSA9IFIuYW5kKGlzRnVuY3Rpb25UZXJtLCBSLmNvbXBsZW1lbnQoUi53aGVyZSh7IG5hbWU6IFIuaXNOaWwgfSkpKTtcbmV4cG9ydCBjb25zdCBpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uID0gUi53aGVyZUVxKHsgdHlwZTogJ1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uJ30pO1xuZXhwb3J0IGNvbnN0IGlzRXhwb3J0U3ludGF4ID0gUi5ib3RoKGlzRXhwb3J0LCBleHAgPT4gUi5vcihpc1N5bnRheERlY2xhcmF0aW9uKGV4cC5kZWNsYXJhdGlvbiksIGlzU3ludGF4cmVjRGVjbGFyYXRpb24oZXhwLmRlY2xhcmF0aW9uKSkpO1xuZXhwb3J0IGNvbnN0IGlzU3ludGF4RGVjbGFyYXRpb25TdGF0ZW1lbnQgPSBSLmJvdGgoaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBkZWNsID0+IGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbihkZWNsLmRlY2xhcmF0aW9uKSk7XG5cblxuZXhwb3J0IGNvbnN0IGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbiA9IFIuZWl0aGVyKGlzU3ludGF4RGVjbGFyYXRpb24sIGlzU3ludGF4cmVjRGVjbGFyYXRpb24pO1xuZXhwb3J0IGNvbnN0IGlzQ29tcGlsZXRpbWVTdGF0ZW1lbnQgPSB0ZXJtID0+IHtcbiAgcmV0dXJuICh0ZXJtIGluc3RhbmNlb2YgVGVybSkgJiYgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm0pICYmIGlzQ29tcGlsZXRpbWVEZWNsYXJhdGlvbih0ZXJtLmRlY2xhcmF0aW9uKTtcbn07XG5leHBvcnQgY29uc3QgaXNJbXBvcnREZWNsYXJhdGlvbiA9IFIuZWl0aGVyKGlzSW1wb3J0LCBpc0ltcG9ydE5hbWVzcGFjZSk7XG4iXX0=