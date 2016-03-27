"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isParenthesizedExpression = exports.isFunctionWithName = exports.isFunctionTerm = exports.isSyntaxrecDeclaration = exports.isSyntaxDeclaration = exports.isEOF = exports.isVariableDeclarator = exports.isVariableDeclaration = exports.isTemplateElement = exports.isSwitchDefault = exports.isSwitchCase = exports.isSuper = exports.isSpreadElement = exports.isScript = exports.isFunctionDeclaration = exports.isFunctionBody = exports.isFormalParameters = exports.isDirective = exports.isCatchClause = exports.isBlock = exports.isWithStatement = exports.isWhileStatement = exports.isVariableDeclarationStatement = exports.isTryFinallyStatement = exports.isTryCatchStatement = exports.isThrowStatement = exports.isSwitchStatementWithDefault = exports.isSwitchStatement = exports.isReturnStatement = exports.isLabeledStatement = exports.isIfStatement = exports.isForStatement = exports.isForOfStatement = exports.isForInStatement = exports.isExpressionStatement = exports.isEmptyStatement = exports.isDoWhileStatement = exports.isDebuggerStatement = exports.isContinueStatement = exports.isBreakStatement = exports.isBlockStatement = exports.isYieldGeneratorExpression = exports.isYieldExpression = exports.isUpdateExpression = exports.isThisExpression = exports.isTemplateExpression = exports.isStaticMemberExpression = exports.isUnaryExpression = exports.isObjectExpression = exports.isNewTargetExpression = exports.isNewExpression = exports.isIdentifierExpression = exports.isFunctionExpression = exports.isConditionalExpression = exports.isComputedMemberExpression = exports.isComputedAssignmentExpression = exports.isCallExpression = exports.isBinaryExpression = exports.isAssignmentExpression = exports.isArrowExpression = exports.isArrayExpression = exports.isLiteralStringExpression = exports.isLiteralRegExpExpression = exports.isLiteralNumericExpression = exports.isLiteralNullExpression = exports.isLiteralInfinityExpression = exports.isLiteralBooleanExpression = exports.isStaticPropertyName = exports.isComputedPropertyName = exports.isShorthandProperty = exports.isDataProperty = exports.isSetter = exports.isGetter = exports.isMethod = exports.isExportSpecifier = exports.isExportDefault = exports.isExport = exports.isExportFrom = exports.isExportAllFrom = exports.isImportSpecifier = exports.isImportNamespace = exports.isImport = exports.isModule = exports.isClassElement = exports.isClassDeclaration = exports.isClassExpression = exports.isBindingPropertyProperty = exports.isBindingPropertyIdentifier = exports.isObjectBinding = exports.isArrayBinding = exports.isBindingIdentifier = exports.isBindingWithDefault = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _errors = require("./errors");

var _utils = require("./utils");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Term = function () {
  function Term(type_867, props_868) {
    _classCallCheck(this, Term);

    this.type = type_867;
    this.loc = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(props_868)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var prop = _step.value;

        this[prop] = props_868[prop];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _createClass(Term, [{
    key: "addScope",
    value: function addScope(scope_869, bindings_870, options_871) {
      var next_872 = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = fieldsIn_866(this)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var field = _step2.value;

          if (this[field] == null) {
            next_872[field] = null;
          } else if (typeof this[field].addScope === "function") {
            next_872[field] = this[field].addScope(scope_869, bindings_870, options_871);
          } else if (_immutable.List.isList(this[field])) {
            next_872[field] = this[field].map(function (f_873) {
              return f_873.addScope(scope_869, bindings_870, options_871);
            });
          } else {
            next_872[field] = this[field];
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return new Term(this.type, next_872);
    }
  }]);

  return Term;
}();

exports.default = Term;
var isBindingWithDefault = exports.isBindingWithDefault = R.whereEq({ type: "BindingWithDefault" });
;
var isBindingIdentifier = exports.isBindingIdentifier = R.whereEq({ type: "BindingIdentifier" });
;
var isArrayBinding = exports.isArrayBinding = R.whereEq({ type: "ArrayBinding" });
;
var isObjectBinding = exports.isObjectBinding = R.whereEq({ type: "ObjectBinding" });
;
var isBindingPropertyIdentifier = exports.isBindingPropertyIdentifier = R.whereEq({ type: "BindingPropertyIdentifier" });
;
var isBindingPropertyProperty = exports.isBindingPropertyProperty = R.whereEq({ type: "BindingPropertyIdentifier" });
;
var isClassExpression = exports.isClassExpression = R.whereEq({ type: "ClassExpression" });
;
var isClassDeclaration = exports.isClassDeclaration = R.whereEq({ type: "ClassDeclaration" });
;
var isClassElement = exports.isClassElement = R.whereEq({ type: "ClassElement" });
;
var isModule = exports.isModule = R.whereEq({ type: "Module" });
;
var isImport = exports.isImport = R.whereEq({ type: "Import" });
;
var isImportNamespace = exports.isImportNamespace = R.whereEq({ type: "ImportNamespace" });
;
var isImportSpecifier = exports.isImportSpecifier = R.whereEq({ type: "ImportSpecifier" });
;
var isExportAllFrom = exports.isExportAllFrom = R.whereEq({ type: "ExportAllFrom" });
;
var isExportFrom = exports.isExportFrom = R.whereEq({ type: "ExportFrom" });
;
var isExport = exports.isExport = R.whereEq({ type: "Export" });
;
var isExportDefault = exports.isExportDefault = R.whereEq({ type: "ExportDefault" });
;
var isExportSpecifier = exports.isExportSpecifier = R.whereEq({ type: "ExportSpecifier" });
;
var isMethod = exports.isMethod = R.whereEq({ type: "Method" });
;
var isGetter = exports.isGetter = R.whereEq({ type: "Getter" });
;
var isSetter = exports.isSetter = R.whereEq({ type: "Setter" });
;
var isDataProperty = exports.isDataProperty = R.whereEq({ type: "DataProperty" });
;
var isShorthandProperty = exports.isShorthandProperty = R.whereEq({ type: "ShorthandProperty" });
;
var isComputedPropertyName = exports.isComputedPropertyName = R.whereEq({ type: "ComputedPropertyName" });
;
var isStaticPropertyName = exports.isStaticPropertyName = R.whereEq({ type: "StaticPropertyName" });
;
var isLiteralBooleanExpression = exports.isLiteralBooleanExpression = R.whereEq({ type: "LiteralBooleanExpression" });
;
var isLiteralInfinityExpression = exports.isLiteralInfinityExpression = R.whereEq({ type: "LiteralInfinityExpression" });
;
var isLiteralNullExpression = exports.isLiteralNullExpression = R.whereEq({ type: "LiteralNullExpression" });
;
var isLiteralNumericExpression = exports.isLiteralNumericExpression = R.whereEq({ type: "LiteralNumericExpression" });
;
var isLiteralRegExpExpression = exports.isLiteralRegExpExpression = R.whereEq({ type: "LiteralRegExpExpression" });
;
var isLiteralStringExpression = exports.isLiteralStringExpression = R.whereEq({ type: "LiteralStringExpression" });
;
var isArrayExpression = exports.isArrayExpression = R.whereEq({ type: "ArrayExpression" });
;
var isArrowExpression = exports.isArrowExpression = R.whereEq({ type: "ArrowExpression" });
;
var isAssignmentExpression = exports.isAssignmentExpression = R.whereEq({ type: "AssignmentExpression" });
;
var isBinaryExpression = exports.isBinaryExpression = R.whereEq({ type: "BinaryExpression" });
;
var isCallExpression = exports.isCallExpression = R.whereEq({ type: "CallExpression" });
;
var isComputedAssignmentExpression = exports.isComputedAssignmentExpression = R.whereEq({ type: "ComputedAssignmentExpression" });
;
var isComputedMemberExpression = exports.isComputedMemberExpression = R.whereEq({ type: "ComputedMemberExpression" });
;
var isConditionalExpression = exports.isConditionalExpression = R.whereEq({ type: "ConditionalExpression" });
;
var isFunctionExpression = exports.isFunctionExpression = R.whereEq({ type: "FunctionExpression" });
;
var isIdentifierExpression = exports.isIdentifierExpression = R.whereEq({ type: "IdentifierExpression" });
;
var isNewExpression = exports.isNewExpression = R.whereEq({ type: "NewExpression" });
;
var isNewTargetExpression = exports.isNewTargetExpression = R.whereEq({ type: "NewTargetExpression" });
;
var isObjectExpression = exports.isObjectExpression = R.whereEq({ type: "ObjectExpression" });
;
var isUnaryExpression = exports.isUnaryExpression = R.whereEq({ type: "UnaryExpression" });
;
var isStaticMemberExpression = exports.isStaticMemberExpression = R.whereEq({ type: "StaticMemberExpression" });
;
var isTemplateExpression = exports.isTemplateExpression = R.whereEq({ type: "TemplateExpression" });
;
var isThisExpression = exports.isThisExpression = R.whereEq({ type: "ThisExpression" });
;
var isUpdateExpression = exports.isUpdateExpression = R.whereEq({ type: "UpdateExpression" });
;
var isYieldExpression = exports.isYieldExpression = R.whereEq({ type: "YieldExpression" });
;
var isYieldGeneratorExpression = exports.isYieldGeneratorExpression = R.whereEq({ type: "YieldGeneratorExpression" });
;
var isBlockStatement = exports.isBlockStatement = R.whereEq({ type: "BlockStatement" });
;
var isBreakStatement = exports.isBreakStatement = R.whereEq({ type: "BreakStatement" });
;
var isContinueStatement = exports.isContinueStatement = R.whereEq({ type: "ContinueStatement" });
;
var isDebuggerStatement = exports.isDebuggerStatement = R.whereEq({ type: "DebuggerStatement" });
;
var isDoWhileStatement = exports.isDoWhileStatement = R.whereEq({ type: "DoWhileStatement" });
;
var isEmptyStatement = exports.isEmptyStatement = R.whereEq({ type: "EmptyStatement" });
;
var isExpressionStatement = exports.isExpressionStatement = R.whereEq({ type: "ExpressionStatement" });
;
var isForInStatement = exports.isForInStatement = R.whereEq({ type: "ForInStatement" });
;
var isForOfStatement = exports.isForOfStatement = R.whereEq({ type: "ForOfStatement" });
;
var isForStatement = exports.isForStatement = R.whereEq({ type: "ForStatement" });
;
var isIfStatement = exports.isIfStatement = R.whereEq({ type: "IfStatement" });
;
var isLabeledStatement = exports.isLabeledStatement = R.whereEq({ type: "LabeledStatement" });
;
var isReturnStatement = exports.isReturnStatement = R.whereEq({ type: "ReturnStatement" });
;
var isSwitchStatement = exports.isSwitchStatement = R.whereEq({ type: "SwitchStatement" });
;
var isSwitchStatementWithDefault = exports.isSwitchStatementWithDefault = R.whereEq({ type: "SwitchStatementWithDefault" });
;
var isThrowStatement = exports.isThrowStatement = R.whereEq({ type: "ThrowStatement" });
;
var isTryCatchStatement = exports.isTryCatchStatement = R.whereEq({ type: "TryCatchStatement" });
;
var isTryFinallyStatement = exports.isTryFinallyStatement = R.whereEq({ type: "TryFinallyStatement" });
;
var isVariableDeclarationStatement = exports.isVariableDeclarationStatement = R.whereEq({ type: "VariableDeclarationStatement" });
;
var isWhileStatement = exports.isWhileStatement = R.whereEq({ type: "WhileStatement" });
;
var isWithStatement = exports.isWithStatement = R.whereEq({ type: "WithStatement" });
;
var isBlock = exports.isBlock = R.whereEq({ type: "Block" });
;
var isCatchClause = exports.isCatchClause = R.whereEq({ type: "CatchClause" });
;
var isDirective = exports.isDirective = R.whereEq({ type: "Directive" });
;
var isFormalParameters = exports.isFormalParameters = R.whereEq({ type: "FormalParameters" });
;
var isFunctionBody = exports.isFunctionBody = R.whereEq({ type: "FunctionBody" });
;
var isFunctionDeclaration = exports.isFunctionDeclaration = R.whereEq({ type: "FunctionDeclaration" });
;
var isScript = exports.isScript = R.whereEq({ type: "Script" });
;
var isSpreadElement = exports.isSpreadElement = R.whereEq({ type: "SpreadElement" });
;
var isSuper = exports.isSuper = R.whereEq({ type: "Super" });
;
var isSwitchCase = exports.isSwitchCase = R.whereEq({ type: "SwitchCase" });
;
var isSwitchDefault = exports.isSwitchDefault = R.whereEq({ type: "SwitchDefault" });
;
var isTemplateElement = exports.isTemplateElement = R.whereEq({ type: "TemplateElement" });
;
var isVariableDeclaration = exports.isVariableDeclaration = R.whereEq({ type: "VariableDeclaration" });
;
var isVariableDeclarator = exports.isVariableDeclarator = R.whereEq({ type: "VariableDeclarator" });
;
var isEOF = exports.isEOF = R.whereEq({ type: "EOF" });
;
var isSyntaxDeclaration = exports.isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: "syntax" }));
;
var isSyntaxrecDeclaration = exports.isSyntaxrecDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: "syntaxrec" }));
;
var isFunctionTerm = exports.isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
;
var isFunctionWithName = exports.isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
;
var isParenthesizedExpression = exports.isParenthesizedExpression = R.whereEq({ type: "ParenthesizedExpression" });
;
var fieldsIn_866 = R.cond([[isBindingWithDefault, R.always(_immutable.List.of("binding", "init"))], [isBindingIdentifier, R.always(_immutable.List.of("name"))], [isArrayBinding, R.always(_immutable.List.of("elements", "restElement"))], [isObjectBinding, R.always(_immutable.List.of("properties"))], [isBindingPropertyIdentifier, R.always(_immutable.List.of("binding", "init"))], [isBindingPropertyProperty, R.always(_immutable.List.of("name", "binding"))], [isClassExpression, R.always(_immutable.List.of("name", "super", "elements"))], [isClassDeclaration, R.always(_immutable.List.of("name", "super", "elements"))], [isClassElement, R.always(_immutable.List.of("isStatic", "method"))], [isModule, R.always(_immutable.List.of("directives", "items"))], [isImport, R.always(_immutable.List.of("moduleSpecifier", "defaultBinding", "namedImports"))], [isImportNamespace, R.always(_immutable.List.of("moduleSpecifier", "defaultBinding", "namespaceBinding"))], [isImportSpecifier, R.always(_immutable.List.of("name", "binding"))], [isExportAllFrom, R.always(_immutable.List.of("moduleSpecifier"))], [isExportFrom, R.always(_immutable.List.of("namedExports", "moduleSpecifier"))], [isExport, R.always(_immutable.List.of("declaration"))], [isExportDefault, R.always(_immutable.List.of("body"))], [isExportSpecifier, R.always(_immutable.List.of("name", "exportedName"))], [isMethod, R.always(_immutable.List.of("body", "isGenerator", "params"))], [isGetter, R.always(_immutable.List.of("body"))], [isSetter, R.always(_immutable.List.of("body", "param"))], [isDataProperty, R.always(_immutable.List.of("name", "expression"))], [isShorthandProperty, R.always(_immutable.List.of("expression"))], [isStaticPropertyName, R.always(_immutable.List.of("value"))], [isLiteralBooleanExpression, R.always(_immutable.List.of("value"))], [isLiteralInfinityExpression, R.always((0, _immutable.List)())], [isLiteralNullExpression, R.always((0, _immutable.List)())], [isLiteralNumericExpression, R.always(_immutable.List.of("value"))], [isLiteralRegExpExpression, R.always(_immutable.List.of("pattern", "flags"))], [isLiteralStringExpression, R.always(_immutable.List.of("value"))], [isArrayExpression, R.always(_immutable.List.of("elements"))], [isArrowExpression, R.always(_immutable.List.of("params", "body"))], [isAssignmentExpression, R.always(_immutable.List.of("binding", "expression"))], [isBinaryExpression, R.always(_immutable.List.of("operator", "left", "right"))], [isCallExpression, R.always(_immutable.List.of("callee", "arguments"))], [isComputedAssignmentExpression, R.always(_immutable.List.of("operator", "binding", "expression"))], [isComputedMemberExpression, R.always(_immutable.List.of("object", "expression"))], [isConditionalExpression, R.always(_immutable.List.of("test", "consequent", "alternate"))], [isFunctionExpression, R.always(_immutable.List.of("name", "isGenerator", "params", "body"))], [isIdentifierExpression, R.always(_immutable.List.of("name"))], [isNewExpression, R.always(_immutable.List.of("callee", "arguments"))], [isNewTargetExpression, R.always((0, _immutable.List)())], [isObjectExpression, R.always(_immutable.List.of("properties"))], [isUnaryExpression, R.always(_immutable.List.of("operator", "operand"))], [isStaticMemberExpression, R.always(_immutable.List.of("object", "property"))], [isTemplateExpression, R.always(_immutable.List.of("tag", "elements"))], [isThisExpression, R.always((0, _immutable.List)())], [isYieldExpression, R.always(_immutable.List.of("expression"))], [isYieldGeneratorExpression, R.always(_immutable.List.of("expression"))], [isBlockStatement, R.always(_immutable.List.of("block"))], [isBreakStatement, R.always(_immutable.List.of("label"))], [isContinueStatement, R.always(_immutable.List.of("label"))], [isDebuggerStatement, R.always((0, _immutable.List)())], [isDoWhileStatement, R.always(_immutable.List.of("test", "body"))], [isEmptyStatement, R.always((0, _immutable.List)())], [isExpressionStatement, R.always(_immutable.List.of("expression"))], [isForInStatement, R.always(_immutable.List.of("left", "right", "body"))], [isForOfStatement, R.always(_immutable.List.of("left", "right", "body"))], [isForStatement, R.always(_immutable.List.of("init", "test", "update", "body"))], [isLabeledStatement, R.always(_immutable.List.of("label", "body"))], [isReturnStatement, R.always(_immutable.List.of("expression"))], [isSwitchStatementWithDefault, R.always(_immutable.List.of("discriminant", "preDefaultCases", "defaultCase", "postDefaultCases"))], [isThrowStatement, R.always(_immutable.List.of("expression"))], [isTryCatchStatement, R.always(_immutable.List.of("body", "catchClause"))], [isTryFinallyStatement, R.always(_immutable.List.of("body", "catchClause", "finalizer"))], [isVariableDeclarationStatement, R.always(_immutable.List.of("declaration"))], [isWithStatement, R.always(_immutable.List.of("object", "body"))], [isBlock, R.always(_immutable.List.of("statements"))], [isCatchClause, R.always(_immutable.List.of("binding", "body"))], [isDirective, R.always(_immutable.List.of("rawValue"))], [isFormalParameters, R.always(_immutable.List.of("items", "rest"))], [isFunctionBody, R.always(_immutable.List.of("directives", "statements"))], [isFunctionDeclaration, R.always(_immutable.List.of("name", "isGenerator", "params", "body"))], [isScript, R.always(_immutable.List.of("directives", "statements"))], [isSpreadElement, R.always(_immutable.List.of("expression"))], [isSuper, R.always((0, _immutable.List)())], [isSwitchCase, R.always(_immutable.List.of("test", "consequent"))], [isSwitchDefault, R.always(_immutable.List.of("consequent"))], [isTemplateElement, R.always(_immutable.List.of("rawValue"))], [isVariableDeclaration, R.always(_immutable.List.of("kind", "declarators"))], [isVariableDeclarator, R.always(_immutable.List.of("binding", "init"))], [isParenthesizedExpression, R.always(_immutable.List.of("inner"))], [R.T, function (type_874) {
  return (0, _errors.assert)(false, "Missing case in fields: " + type_874.type);
}]]);
//# sourceMappingURL=data:application/json;base64,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Q0FBejhJLEVBQXMrSSxDQUFDLFlBQUQsRUFBZSxFQUFFLE1BQUYsQ0FBUyxnQkFBSyxFQUFMLENBQVEsTUFBUixFQUFnQixZQUFoQixDQUFULENBQWYsQ0FBdCtJLEVBQStoSixDQUFDLGVBQUQsRUFBa0IsRUFBRSxNQUFGLENBQVMsZ0JBQUssRUFBTCxDQUFRLFlBQVIsQ0FBVCxDQUFsQixDQUEvaEosRUFBbWxKLENBQUMsaUJBQUQsRUFBb0IsRUFBRSxNQUFGLENBQVMsZ0JBQUssRUFBTCxDQUFRLFVBQVIsQ0FBVCxDQUFwQixDQUFubEosRUFBdW9KLENBQUMscUJBQUQsRUFBd0IsRUFBRSxNQUFGLENBQVMsZ0JBQUssRUFBTCxDQUFRLE1BQVIsRUFBZ0IsYUFBaEIsQ0FBVCxDQUF4QixDQUF2b0osRUFBMHNKLENBQUMsb0JBQUQsRUFBdUIsRUFBRSxNQUFGLENBQVMsZ0JBQUssRUFBTCxDQUFRLFNBQVIsRUFBbUIsTUFBbkIsQ0FBVCxDQUF2QixDQUExc0osRUFBd3dKLENBQUMseUJBQUQsRUFBNEIsRUFBRSxNQUFGLENBQVMsZ0JBQUssRUFBTCxDQUFRLE9BQVIsQ0FBVCxDQUE1QixDQUF4d0osRUFBaTBKLENBQUMsRUFBRSxDQUFGLEVBQUs7U0FBWSxvQkFBTyxLQUFQLEVBQWMsNkJBQTZCLFNBQVMsSUFBVDtDQUF2RCxDQUF2MEosQ0FBUCxDQUFmIiwiZmlsZSI6InRlcm1zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydCwgZXhwZWN0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7bWl4aW59IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0ICAqIGFzIFIgZnJvbSBcInJhbWRhXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtIHtcbiAgY29uc3RydWN0b3IodHlwZV84NjcsIHByb3BzXzg2OCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGVfODY3O1xuICAgIHRoaXMubG9jID0gbnVsbDtcbiAgICBmb3IgKGxldCBwcm9wIG9mIE9iamVjdC5rZXlzKHByb3BzXzg2OCkpIHtcbiAgICAgIHRoaXNbcHJvcF0gPSBwcm9wc184NjhbcHJvcF07XG4gICAgfVxuICB9XG4gIGFkZFNjb3BlKHNjb3BlXzg2OSwgYmluZGluZ3NfODcwLCBvcHRpb25zXzg3MSkge1xuICAgIGxldCBuZXh0Xzg3MiA9IHt9O1xuICAgIGZvciAobGV0IGZpZWxkIG9mIGZpZWxkc0luXzg2Nih0aGlzKSkge1xuICAgICAgaWYgKHRoaXNbZmllbGRdID09IG51bGwpIHtcbiAgICAgICAgbmV4dF84NzJbZmllbGRdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXNbZmllbGRdLmFkZFNjb3BlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgbmV4dF84NzJbZmllbGRdID0gdGhpc1tmaWVsZF0uYWRkU2NvcGUoc2NvcGVfODY5LCBiaW5kaW5nc184NzAsIG9wdGlvbnNfODcxKTtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdC5pc0xpc3QodGhpc1tmaWVsZF0pKSB7XG4gICAgICAgIG5leHRfODcyW2ZpZWxkXSA9IHRoaXNbZmllbGRdLm1hcChmXzg3MyA9PiBmXzg3My5hZGRTY29wZShzY29wZV84NjksIGJpbmRpbmdzXzg3MCwgb3B0aW9uc184NzEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfODcyW2ZpZWxkXSA9IHRoaXNbZmllbGRdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odGhpcy50eXBlLCBuZXh0Xzg3Mik7XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBpc0JpbmRpbmdXaXRoRGVmYXVsdCA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5kaW5nV2l0aERlZmF1bHRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQmluZGluZ0lkZW50aWZpZXIgPSBSLndoZXJlRXEoe3R5cGU6IFwiQmluZGluZ0lkZW50aWZpZXJcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQXJyYXlCaW5kaW5nID0gUi53aGVyZUVxKHt0eXBlOiBcIkFycmF5QmluZGluZ1wifSk7XG47XG5leHBvcnQgY29uc3QgaXNPYmplY3RCaW5kaW5nID0gUi53aGVyZUVxKHt0eXBlOiBcIk9iamVjdEJpbmRpbmdcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciA9IFIud2hlcmVFcSh7dHlwZTogXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5ID0gUi53aGVyZUVxKHt0eXBlOiBcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQ2xhc3NFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNDbGFzc0RlY2xhcmF0aW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRGVjbGFyYXRpb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQ2xhc3NFbGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIkNsYXNzRWxlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNNb2R1bGUgPSBSLndoZXJlRXEoe3R5cGU6IFwiTW9kdWxlXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0ltcG9ydCA9IFIud2hlcmVFcSh7dHlwZTogXCJJbXBvcnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzSW1wb3J0TmFtZXNwYWNlID0gUi53aGVyZUVxKHt0eXBlOiBcIkltcG9ydE5hbWVzcGFjZVwifSk7XG47XG5leHBvcnQgY29uc3QgaXNJbXBvcnRTcGVjaWZpZXIgPSBSLndoZXJlRXEoe3R5cGU6IFwiSW1wb3J0U3BlY2lmaWVyXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0V4cG9ydEFsbEZyb20gPSBSLndoZXJlRXEoe3R5cGU6IFwiRXhwb3J0QWxsRnJvbVwifSk7XG47XG5leHBvcnQgY29uc3QgaXNFeHBvcnRGcm9tID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydEZyb21cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzRXhwb3J0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNFeHBvcnREZWZhdWx0ID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydERlZmF1bHRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzRXhwb3J0U3BlY2lmaWVyID0gUi53aGVyZUVxKHt0eXBlOiBcIkV4cG9ydFNwZWNpZmllclwifSk7XG47XG5leHBvcnQgY29uc3QgaXNNZXRob2QgPSBSLndoZXJlRXEoe3R5cGU6IFwiTWV0aG9kXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0dldHRlciA9IFIud2hlcmVFcSh7dHlwZTogXCJHZXR0ZXJcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzU2V0dGVyID0gUi53aGVyZUVxKHt0eXBlOiBcIlNldHRlclwifSk7XG47XG5leHBvcnQgY29uc3QgaXNEYXRhUHJvcGVydHkgPSBSLndoZXJlRXEoe3R5cGU6IFwiRGF0YVByb3BlcnR5XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1Nob3J0aGFuZFByb3BlcnR5ID0gUi53aGVyZUVxKHt0eXBlOiBcIlNob3J0aGFuZFByb3BlcnR5XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0NvbXB1dGVkUHJvcGVydHlOYW1lID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1N0YXRpY1Byb3BlcnR5TmFtZSA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzTGl0ZXJhbE51bGxFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0xpdGVyYWxSZWdFeHBFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0xpdGVyYWxTdHJpbmdFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0FycmF5RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJBcnJheUV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQXJyb3dFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkFycm93RXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNBc3NpZ25tZW50RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJBc3NpZ25tZW50RXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNCaW5hcnlFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQ2FsbEV4cHJlc3Npb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiQ2FsbEV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQ29tcHV0ZWRBc3NpZ25tZW50RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJDb21wdXRlZEFzc2lnbm1lbnRFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0NvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzQ29uZGl0aW9uYWxFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbkV4cHJlc3Npb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0lkZW50aWZpZXJFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIklkZW50aWZpZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc05ld0V4cHJlc3Npb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiTmV3RXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNOZXdUYXJnZXRFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIk5ld1RhcmdldEV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzT2JqZWN0RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJPYmplY3RFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1VuYXJ5RXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJVbmFyeUV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1RlbXBsYXRlRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJUZW1wbGF0ZUV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzVGhpc0V4cHJlc3Npb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiVGhpc0V4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzVXBkYXRlRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1lpZWxkRXhwcmVzc2lvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJZaWVsZEV4cHJlc3Npb25cIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNCbG9ja1N0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJCbG9ja1N0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNCcmVha1N0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJCcmVha1N0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNDb250aW51ZVN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJDb250aW51ZVN0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNEZWJ1Z2dlclN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJEZWJ1Z2dlclN0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNEb1doaWxlU3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIkRvV2hpbGVTdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzRW1wdHlTdGF0ZW1lbnQgPSBSLndoZXJlRXEoe3R5cGU6IFwiRW1wdHlTdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzRXhwcmVzc2lvblN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJFeHByZXNzaW9uU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0ZvckluU3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvckluU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0Zvck9mU3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIkZvck9mU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0ZvclN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJGb3JTdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzSWZTdGF0ZW1lbnQgPSBSLndoZXJlRXEoe3R5cGU6IFwiSWZTdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzTGFiZWxlZFN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJMYWJlbGVkU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1JldHVyblN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJSZXR1cm5TdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzU3dpdGNoU3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIlN3aXRjaFN0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCA9IFIud2hlcmVFcSh7dHlwZTogXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNUaHJvd1N0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJUaHJvd1N0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNUcnlDYXRjaFN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJUcnlDYXRjaFN0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNUcnlGaW5hbGx5U3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1doaWxlU3RhdGVtZW50ID0gUi53aGVyZUVxKHt0eXBlOiBcIldoaWxlU3RhdGVtZW50XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1dpdGhTdGF0ZW1lbnQgPSBSLndoZXJlRXEoe3R5cGU6IFwiV2l0aFN0YXRlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNCbG9jayA9IFIud2hlcmVFcSh7dHlwZTogXCJCbG9ja1wifSk7XG47XG5leHBvcnQgY29uc3QgaXNDYXRjaENsYXVzZSA9IFIud2hlcmVFcSh7dHlwZTogXCJDYXRjaENsYXVzZVwifSk7XG47XG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmUgPSBSLndoZXJlRXEoe3R5cGU6IFwiRGlyZWN0aXZlXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0Zvcm1hbFBhcmFtZXRlcnMgPSBSLndoZXJlRXEoe3R5cGU6IFwiRm9ybWFsUGFyYW1ldGVyc1wifSk7XG47XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbkJvZHkgPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25Cb2R5XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24gPSBSLndoZXJlRXEoe3R5cGU6IFwiRnVuY3Rpb25EZWNsYXJhdGlvblwifSk7XG47XG5leHBvcnQgY29uc3QgaXNTY3JpcHQgPSBSLndoZXJlRXEoe3R5cGU6IFwiU2NyaXB0XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1NwcmVhZEVsZW1lbnQgPSBSLndoZXJlRXEoe3R5cGU6IFwiU3ByZWFkRWxlbWVudFwifSk7XG47XG5leHBvcnQgY29uc3QgaXNTdXBlciA9IFIud2hlcmVFcSh7dHlwZTogXCJTdXBlclwifSk7XG47XG5leHBvcnQgY29uc3QgaXNTd2l0Y2hDYXNlID0gUi53aGVyZUVxKHt0eXBlOiBcIlN3aXRjaENhc2VcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzU3dpdGNoRGVmYXVsdCA9IFIud2hlcmVFcSh7dHlwZTogXCJTd2l0Y2hEZWZhdWx0XCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1RlbXBsYXRlRWxlbWVudCA9IFIud2hlcmVFcSh7dHlwZTogXCJUZW1wbGF0ZUVsZW1lbnRcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzVmFyaWFibGVEZWNsYXJhdGlvbiA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0aW9uXCJ9KTtcbjtcbmV4cG9ydCBjb25zdCBpc1ZhcmlhYmxlRGVjbGFyYXRvciA9IFIud2hlcmVFcSh7dHlwZTogXCJWYXJpYWJsZURlY2xhcmF0b3JcIn0pO1xuO1xuZXhwb3J0IGNvbnN0IGlzRU9GID0gUi53aGVyZUVxKHt0eXBlOiBcIkVPRlwifSk7XG47XG5leHBvcnQgY29uc3QgaXNTeW50YXhEZWNsYXJhdGlvbiA9IFIuYm90aChpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIFIud2hlcmVFcSh7a2luZDogXCJzeW50YXhcIn0pKTtcbjtcbmV4cG9ydCBjb25zdCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uID0gUi5ib3RoKGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgUi53aGVyZUVxKHtraW5kOiBcInN5bnRheHJlY1wifSkpO1xuO1xuZXhwb3J0IGNvbnN0IGlzRnVuY3Rpb25UZXJtID0gUi5laXRoZXIoaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbik7XG47XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbldpdGhOYW1lID0gUi5hbmQoaXNGdW5jdGlvblRlcm0sIFIuY29tcGxlbWVudChSLndoZXJlKHtuYW1lOiBSLmlzTmlsfSkpKTtcbjtcbmV4cG9ydCBjb25zdCBpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uID0gUi53aGVyZUVxKHt0eXBlOiBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCJ9KTtcbjtcbmNvbnN0IGZpZWxkc0luXzg2NiA9IFIuY29uZChbW2lzQmluZGluZ1dpdGhEZWZhdWx0LCBSLmFsd2F5cyhMaXN0Lm9mKFwiYmluZGluZ1wiLCBcImluaXRcIikpXSwgW2lzQmluZGluZ0lkZW50aWZpZXIsIFIuYWx3YXlzKExpc3Qub2YoXCJuYW1lXCIpKV0sIFtpc0FycmF5QmluZGluZywgUi5hbHdheXMoTGlzdC5vZihcImVsZW1lbnRzXCIsIFwicmVzdEVsZW1lbnRcIikpXSwgW2lzT2JqZWN0QmluZGluZywgUi5hbHdheXMoTGlzdC5vZihcInByb3BlcnRpZXNcIikpXSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgUi5hbHdheXMoTGlzdC5vZihcImJpbmRpbmdcIiwgXCJpbml0XCIpKV0sIFtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZVwiLCBcImJpbmRpbmdcIikpXSwgW2lzQ2xhc3NFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZVwiLCBcInN1cGVyXCIsIFwiZWxlbWVudHNcIikpXSwgW2lzQ2xhc3NEZWNsYXJhdGlvbiwgUi5hbHdheXMoTGlzdC5vZihcIm5hbWVcIiwgXCJzdXBlclwiLCBcImVsZW1lbnRzXCIpKV0sIFtpc0NsYXNzRWxlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcImlzU3RhdGljXCIsIFwibWV0aG9kXCIpKV0sIFtpc01vZHVsZSwgUi5hbHdheXMoTGlzdC5vZihcImRpcmVjdGl2ZXNcIiwgXCJpdGVtc1wiKSldLCBbaXNJbXBvcnQsIFIuYWx3YXlzKExpc3Qub2YoXCJtb2R1bGVTcGVjaWZpZXJcIiwgXCJkZWZhdWx0QmluZGluZ1wiLCBcIm5hbWVkSW1wb3J0c1wiKSldLCBbaXNJbXBvcnROYW1lc3BhY2UsIFIuYWx3YXlzKExpc3Qub2YoXCJtb2R1bGVTcGVjaWZpZXJcIiwgXCJkZWZhdWx0QmluZGluZ1wiLCBcIm5hbWVzcGFjZUJpbmRpbmdcIikpXSwgW2lzSW1wb3J0U3BlY2lmaWVyLCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZVwiLCBcImJpbmRpbmdcIikpXSwgW2lzRXhwb3J0QWxsRnJvbSwgUi5hbHdheXMoTGlzdC5vZihcIm1vZHVsZVNwZWNpZmllclwiKSldLCBbaXNFeHBvcnRGcm9tLCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZWRFeHBvcnRzXCIsIFwibW9kdWxlU3BlY2lmaWVyXCIpKV0sIFtpc0V4cG9ydCwgUi5hbHdheXMoTGlzdC5vZihcImRlY2xhcmF0aW9uXCIpKV0sIFtpc0V4cG9ydERlZmF1bHQsIFIuYWx3YXlzKExpc3Qub2YoXCJib2R5XCIpKV0sIFtpc0V4cG9ydFNwZWNpZmllciwgUi5hbHdheXMoTGlzdC5vZihcIm5hbWVcIiwgXCJleHBvcnRlZE5hbWVcIikpXSwgW2lzTWV0aG9kLCBSLmFsd2F5cyhMaXN0Lm9mKFwiYm9keVwiLCBcImlzR2VuZXJhdG9yXCIsIFwicGFyYW1zXCIpKV0sIFtpc0dldHRlciwgUi5hbHdheXMoTGlzdC5vZihcImJvZHlcIikpXSwgW2lzU2V0dGVyLCBSLmFsd2F5cyhMaXN0Lm9mKFwiYm9keVwiLCBcInBhcmFtXCIpKV0sIFtpc0RhdGFQcm9wZXJ0eSwgUi5hbHdheXMoTGlzdC5vZihcIm5hbWVcIiwgXCJleHByZXNzaW9uXCIpKV0sIFtpc1Nob3J0aGFuZFByb3BlcnR5LCBSLmFsd2F5cyhMaXN0Lm9mKFwiZXhwcmVzc2lvblwiKSldLCBbaXNTdGF0aWNQcm9wZXJ0eU5hbWUsIFIuYWx3YXlzKExpc3Qub2YoXCJ2YWx1ZVwiKSldLCBbaXNMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJ2YWx1ZVwiKSldLCBbaXNMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0KCkpXSwgW2lzTGl0ZXJhbE51bGxFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0KCkpXSwgW2lzTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwidmFsdWVcIikpXSwgW2lzTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJwYXR0ZXJuXCIsIFwiZmxhZ3NcIikpXSwgW2lzTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJ2YWx1ZVwiKSldLCBbaXNBcnJheUV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJlbGVtZW50c1wiKSldLCBbaXNBcnJvd0V4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJwYXJhbXNcIiwgXCJib2R5XCIpKV0sIFtpc0Fzc2lnbm1lbnRFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwiYmluZGluZ1wiLCBcImV4cHJlc3Npb25cIikpXSwgW2lzQmluYXJ5RXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcIm9wZXJhdG9yXCIsIFwibGVmdFwiLCBcInJpZ2h0XCIpKV0sIFtpc0NhbGxFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwiY2FsbGVlXCIsIFwiYXJndW1lbnRzXCIpKV0sIFtpc0NvbXB1dGVkQXNzaWdubWVudEV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJvcGVyYXRvclwiLCBcImJpbmRpbmdcIiwgXCJleHByZXNzaW9uXCIpKV0sIFtpc0NvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcIm9iamVjdFwiLCBcImV4cHJlc3Npb25cIikpXSwgW2lzQ29uZGl0aW9uYWxFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwidGVzdFwiLCBcImNvbnNlcXVlbnRcIiwgXCJhbHRlcm5hdGVcIikpXSwgW2lzRnVuY3Rpb25FeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZVwiLCBcImlzR2VuZXJhdG9yXCIsIFwicGFyYW1zXCIsIFwiYm9keVwiKSldLCBbaXNJZGVudGlmaWVyRXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcIm5hbWVcIikpXSwgW2lzTmV3RXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcImNhbGxlZVwiLCBcImFyZ3VtZW50c1wiKSldLCBbaXNOZXdUYXJnZXRFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0KCkpXSwgW2lzT2JqZWN0RXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcInByb3BlcnRpZXNcIikpXSwgW2lzVW5hcnlFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwib3BlcmF0b3JcIiwgXCJvcGVyYW5kXCIpKV0sIFtpc1N0YXRpY01lbWJlckV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJvYmplY3RcIiwgXCJwcm9wZXJ0eVwiKSldLCBbaXNUZW1wbGF0ZUV4cHJlc3Npb24sIFIuYWx3YXlzKExpc3Qub2YoXCJ0YWdcIiwgXCJlbGVtZW50c1wiKSldLCBbaXNUaGlzRXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdCgpKV0sIFtpc1lpZWxkRXhwcmVzc2lvbiwgUi5hbHdheXMoTGlzdC5vZihcImV4cHJlc3Npb25cIikpXSwgW2lzWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwiZXhwcmVzc2lvblwiKSldLCBbaXNCbG9ja1N0YXRlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcImJsb2NrXCIpKV0sIFtpc0JyZWFrU3RhdGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwibGFiZWxcIikpXSwgW2lzQ29udGludWVTdGF0ZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJsYWJlbFwiKSldLCBbaXNEZWJ1Z2dlclN0YXRlbWVudCwgUi5hbHdheXMoTGlzdCgpKV0sIFtpc0RvV2hpbGVTdGF0ZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJ0ZXN0XCIsIFwiYm9keVwiKSldLCBbaXNFbXB0eVN0YXRlbWVudCwgUi5hbHdheXMoTGlzdCgpKV0sIFtpc0V4cHJlc3Npb25TdGF0ZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJleHByZXNzaW9uXCIpKV0sIFtpc0ZvckluU3RhdGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwibGVmdFwiLCBcInJpZ2h0XCIsIFwiYm9keVwiKSldLCBbaXNGb3JPZlN0YXRlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcImxlZnRcIiwgXCJyaWdodFwiLCBcImJvZHlcIikpXSwgW2lzRm9yU3RhdGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwiaW5pdFwiLCBcInRlc3RcIiwgXCJ1cGRhdGVcIiwgXCJib2R5XCIpKV0sIFtpc0xhYmVsZWRTdGF0ZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJsYWJlbFwiLCBcImJvZHlcIikpXSwgW2lzUmV0dXJuU3RhdGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwiZXhwcmVzc2lvblwiKSldLCBbaXNTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCwgUi5hbHdheXMoTGlzdC5vZihcImRpc2NyaW1pbmFudFwiLCBcInByZURlZmF1bHRDYXNlc1wiLCBcImRlZmF1bHRDYXNlXCIsIFwicG9zdERlZmF1bHRDYXNlc1wiKSldLCBbaXNUaHJvd1N0YXRlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcImV4cHJlc3Npb25cIikpXSwgW2lzVHJ5Q2F0Y2hTdGF0ZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJib2R5XCIsIFwiY2F0Y2hDbGF1c2VcIikpXSwgW2lzVHJ5RmluYWxseVN0YXRlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcImJvZHlcIiwgXCJjYXRjaENsYXVzZVwiLCBcImZpbmFsaXplclwiKSldLCBbaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwiZGVjbGFyYXRpb25cIikpXSwgW2lzV2l0aFN0YXRlbWVudCwgUi5hbHdheXMoTGlzdC5vZihcIm9iamVjdFwiLCBcImJvZHlcIikpXSwgW2lzQmxvY2ssIFIuYWx3YXlzKExpc3Qub2YoXCJzdGF0ZW1lbnRzXCIpKV0sIFtpc0NhdGNoQ2xhdXNlLCBSLmFsd2F5cyhMaXN0Lm9mKFwiYmluZGluZ1wiLCBcImJvZHlcIikpXSwgW2lzRGlyZWN0aXZlLCBSLmFsd2F5cyhMaXN0Lm9mKFwicmF3VmFsdWVcIikpXSwgW2lzRm9ybWFsUGFyYW1ldGVycywgUi5hbHdheXMoTGlzdC5vZihcIml0ZW1zXCIsIFwicmVzdFwiKSldLCBbaXNGdW5jdGlvbkJvZHksIFIuYWx3YXlzKExpc3Qub2YoXCJkaXJlY3RpdmVzXCIsIFwic3RhdGVtZW50c1wiKSldLCBbaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwibmFtZVwiLCBcImlzR2VuZXJhdG9yXCIsIFwicGFyYW1zXCIsIFwiYm9keVwiKSldLCBbaXNTY3JpcHQsIFIuYWx3YXlzKExpc3Qub2YoXCJkaXJlY3RpdmVzXCIsIFwic3RhdGVtZW50c1wiKSldLCBbaXNTcHJlYWRFbGVtZW50LCBSLmFsd2F5cyhMaXN0Lm9mKFwiZXhwcmVzc2lvblwiKSldLCBbaXNTdXBlciwgUi5hbHdheXMoTGlzdCgpKV0sIFtpc1N3aXRjaENhc2UsIFIuYWx3YXlzKExpc3Qub2YoXCJ0ZXN0XCIsIFwiY29uc2VxdWVudFwiKSldLCBbaXNTd2l0Y2hEZWZhdWx0LCBSLmFsd2F5cyhMaXN0Lm9mKFwiY29uc2VxdWVudFwiKSldLCBbaXNUZW1wbGF0ZUVsZW1lbnQsIFIuYWx3YXlzKExpc3Qub2YoXCJyYXdWYWx1ZVwiKSldLCBbaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwia2luZFwiLCBcImRlY2xhcmF0b3JzXCIpKV0sIFtpc1ZhcmlhYmxlRGVjbGFyYXRvciwgUi5hbHdheXMoTGlzdC5vZihcImJpbmRpbmdcIiwgXCJpbml0XCIpKV0sIFtpc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uLCBSLmFsd2F5cyhMaXN0Lm9mKFwiaW5uZXJcIikpXSwgW1IuVCwgdHlwZV84NzQgPT4gYXNzZXJ0KGZhbHNlLCBcIk1pc3NpbmcgY2FzZSBpbiBmaWVsZHM6IFwiICsgdHlwZV84NzQudHlwZSldXSk7XG4iXX0=