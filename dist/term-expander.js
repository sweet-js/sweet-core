"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _scope = require("./scope");

var _applyScopeInParamsReducer = require("./apply-scope-in-params-reducer");

var _applyScopeInParamsReducer2 = _interopRequireDefault(_applyScopeInParamsReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _compiler = require("./compiler");

var _compiler2 = _interopRequireDefault(_compiler);

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _serializer = require("./serializer");

var _enforester = require("./enforester");

var _errors = require("./errors");

var _templateProcessor = require("./template-processor.js");

var _astDispatcher = require("./ast-dispatcher");

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TermExpander extends _astDispatcher2.default {
  constructor(context_936) {
    super("expand", true);
    this.context = context_936;
  }
  expand(term_937) {
    return this.dispatch(term_937);
  }
  expandPragma(term_938) {
    return term_938;
  }
  expandTemplateExpression(term_939) {
    return new _terms2.default("TemplateExpression", { tag: term_939.tag == null ? null : this.expand(term_939.tag), elements: term_939.elements.toArray() });
  }
  expandBreakStatement(term_940) {
    return new _terms2.default("BreakStatement", { label: term_940.label ? term_940.label.val() : null });
  }
  expandDoWhileStatement(term_941) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_941.body), test: this.expand(term_941.test) });
  }
  expandWithStatement(term_942) {
    return new _terms2.default("WithStatement", { body: this.expand(term_942.body), object: this.expand(term_942.object) });
  }
  expandDebuggerStatement(term_943) {
    return term_943;
  }
  expandContinueStatement(term_944) {
    return new _terms2.default("ContinueStatement", { label: term_944.label ? term_944.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_945) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_945.discriminant), preDefaultCases: term_945.preDefaultCases.map(c_946 => this.expand(c_946)).toArray(), defaultCase: this.expand(term_945.defaultCase), postDefaultCases: term_945.postDefaultCases.map(c_947 => this.expand(c_947)).toArray() });
  }
  expandComputedMemberExpression(term_948) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_948.object), expression: this.expand(term_948.expression) });
  }
  expandSwitchStatement(term_949) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_949.discriminant), cases: term_949.cases.map(c_950 => this.expand(c_950)).toArray() });
  }
  expandFormalParameters(term_951) {
    let rest_952 = term_951.rest == null ? null : this.expand(term_951.rest);
    return new _terms2.default("FormalParameters", { items: term_951.items.map(i_953 => this.expand(i_953)), rest: rest_952 });
  }
  expandArrowExpression(term_954) {
    return this.doFunctionExpansion(term_954, "ArrowExpression");
  }
  expandSwitchDefault(term_955) {
    return new _terms2.default("SwitchDefault", { consequent: term_955.consequent.map(c_956 => this.expand(c_956)).toArray() });
  }
  expandSwitchCase(term_957) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_957.test), consequent: term_957.consequent.map(c_958 => this.expand(c_958)).toArray() });
  }
  expandForInStatement(term_959) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_959.left), right: this.expand(term_959.right), body: this.expand(term_959.body) });
  }
  expandTryCatchStatement(term_960) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_960.body), catchClause: this.expand(term_960.catchClause) });
  }
  expandTryFinallyStatement(term_961) {
    let catchClause_962 = term_961.catchClause == null ? null : this.expand(term_961.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_961.body), catchClause: catchClause_962, finalizer: this.expand(term_961.finalizer) });
  }
  expandCatchClause(term_963) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_963.binding), body: this.expand(term_963.body) });
  }
  expandThrowStatement(term_964) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_964.expression) });
  }
  expandForOfStatement(term_965) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_965.left), right: this.expand(term_965.right), body: this.expand(term_965.body) });
  }
  expandBindingIdentifier(term_966) {
    return term_966;
  }
  expandBindingPropertyIdentifier(term_967) {
    return term_967;
  }
  expandBindingPropertyProperty(term_968) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_968.name), binding: this.expand(term_968.binding) });
  }
  expandComputedPropertyName(term_969) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_969.expression) });
  }
  expandObjectBinding(term_970) {
    return new _terms2.default("ObjectBinding", { properties: term_970.properties.map(t_971 => this.expand(t_971)).toArray() });
  }
  expandArrayBinding(term_972) {
    let restElement_973 = term_972.restElement == null ? null : this.expand(term_972.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_972.elements.map(t_974 => t_974 == null ? null : this.expand(t_974)).toArray(), restElement: restElement_973 });
  }
  expandBindingWithDefault(term_975) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_975.binding), init: this.expand(term_975.init) });
  }
  expandShorthandProperty(term_976) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_976.name }), expression: new _terms2.default("IdentifierExpression", { name: term_976.name }) });
  }
  expandForStatement(term_977) {
    let init_978 = term_977.init == null ? null : this.expand(term_977.init);
    let test_979 = term_977.test == null ? null : this.expand(term_977.test);
    let update_980 = term_977.update == null ? null : this.expand(term_977.update);
    let body_981 = this.expand(term_977.body);
    return new _terms2.default("ForStatement", { init: init_978, test: test_979, update: update_980, body: body_981 });
  }
  expandYieldExpression(term_982) {
    let expr_983 = term_982.expression == null ? null : this.expand(term_982.expression);
    return new _terms2.default("YieldExpression", { expression: expr_983 });
  }
  expandYieldGeneratorExpression(term_984) {
    let expr_985 = term_984.expression == null ? null : this.expand(term_984.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_985 });
  }
  expandWhileStatement(term_986) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_986.test), body: this.expand(term_986.body) });
  }
  expandIfStatement(term_987) {
    let consequent_988 = term_987.consequent == null ? null : this.expand(term_987.consequent);
    let alternate_989 = term_987.alternate == null ? null : this.expand(term_987.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_987.test), consequent: consequent_988, alternate: alternate_989 });
  }
  expandBlockStatement(term_990) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_990.block) });
  }
  expandBlock(term_991) {
    return new _terms2.default("Block", { statements: term_991.statements.map(s_992 => this.expand(s_992)).toArray() });
  }
  expandVariableDeclarationStatement(term_993) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_993.declaration) });
  }
  expandReturnStatement(term_994) {
    if (term_994.expression == null) {
      return term_994;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_994.expression) });
  }
  expandClassDeclaration(term_995) {
    return new _terms2.default("ClassDeclaration", { name: term_995.name == null ? null : this.expand(term_995.name), super: term_995.super == null ? null : this.expand(term_995.super), elements: term_995.elements.map(el_996 => this.expand(el_996)).toArray() });
  }
  expandClassExpression(term_997) {
    return new _terms2.default("ClassExpression", { name: term_997.name == null ? null : this.expand(term_997.name), super: term_997.super == null ? null : this.expand(term_997.super), elements: term_997.elements.map(el_998 => this.expand(el_998)).toArray() });
  }
  expandClassElement(term_999) {
    return new _terms2.default("ClassElement", { isStatic: term_999.isStatic, method: this.expand(term_999.method) });
  }
  expandThisExpression(term_1000) {
    return term_1000;
  }
  expandSyntaxTemplate(term_1001) {
    let r_1002 = (0, _templateProcessor.processTemplate)(term_1001.template.inner());
    let str_1003 = _syntax2.default.from("string", _serializer.serializer.write(r_1002.template));
    let callee_1004 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1005 = r_1002.interp.map(i_1007 => {
      let enf_1008 = new _enforester.Enforester(i_1007, (0, _immutable.List)(), this.context);
      return this.expand(enf_1008.enforest("expression"));
    });
    let args_1006 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1003 })).concat(expandedInterps_1005);
    return new _terms2.default("CallExpression", { callee: callee_1004, arguments: args_1006 });
  }
  expandSyntaxQuote(term_1009) {
    let str_1010 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1009.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1009.template.tag, elements: term_1009.template.elements.push(str_1010).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1011) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1011.object), property: term_1011.property });
  }
  expandArrayExpression(term_1012) {
    return new _terms2.default("ArrayExpression", { elements: term_1012.elements.map(t_1013 => t_1013 == null ? t_1013 : this.expand(t_1013)) });
  }
  expandImport(term_1014) {
    return term_1014;
  }
  expandImportNamespace(term_1015) {
    return term_1015;
  }
  expandExport(term_1016) {
    return new _terms2.default("Export", { declaration: this.expand(term_1016.declaration) });
  }
  expandExportDefault(term_1017) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1017.body) });
  }
  expandExportFrom(term_1018) {
    return term_1018;
  }
  expandExportAllFrom(term_1019) {
    return term_1019;
  }
  expandExportSpecifier(term_1020) {
    return term_1020;
  }
  expandStaticPropertyName(term_1021) {
    return term_1021;
  }
  expandDataProperty(term_1022) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1022.name), expression: this.expand(term_1022.expression) });
  }
  expandObjectExpression(term_1023) {
    return new _terms2.default("ObjectExpression", { properties: term_1023.properties.map(t_1024 => this.expand(t_1024)) });
  }
  expandVariableDeclarator(term_1025) {
    let init_1026 = term_1025.init == null ? null : this.expand(term_1025.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1025.binding), init: init_1026 });
  }
  expandVariableDeclaration(term_1027) {
    if (term_1027.kind === "syntax" || term_1027.kind === "syntaxrec") {
      return term_1027;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1027.kind, declarators: term_1027.declarators.map(d_1028 => this.expand(d_1028)) });
  }
  expandParenthesizedExpression(term_1029) {
    if (term_1029.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1030 = new _enforester.Enforester(term_1029.inner, (0, _immutable.List)(), this.context);
    let lookahead_1031 = enf_1030.peek();
    let t_1032 = enf_1030.enforestExpression();
    if (t_1032 == null || enf_1030.rest.size > 0) {
      throw enf_1030.createError(lookahead_1031, "unexpected syntax");
    }
    return this.expand(t_1032);
  }
  expandUnaryExpression(term_1033) {
    return new _terms2.default("UnaryExpression", { operator: term_1033.operator, operand: this.expand(term_1033.operand) });
  }
  expandUpdateExpression(term_1034) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1034.isPrefix, operator: term_1034.operator, operand: this.expand(term_1034.operand) });
  }
  expandBinaryExpression(term_1035) {
    let left_1036 = this.expand(term_1035.left);
    let right_1037 = this.expand(term_1035.right);
    return new _terms2.default("BinaryExpression", { left: left_1036, operator: term_1035.operator, right: right_1037 });
  }
  expandConditionalExpression(term_1038) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1038.test), consequent: this.expand(term_1038.consequent), alternate: this.expand(term_1038.alternate) });
  }
  expandNewTargetExpression(term_1039) {
    return term_1039;
  }
  expandNewExpression(term_1040) {
    let callee_1041 = this.expand(term_1040.callee);
    let enf_1042 = new _enforester.Enforester(term_1040.arguments, (0, _immutable.List)(), this.context);
    let args_1043 = enf_1042.enforestArgumentList().map(arg_1044 => this.expand(arg_1044));
    return new _terms2.default("NewExpression", { callee: callee_1041, arguments: args_1043.toArray() });
  }
  expandSuper(term_1045) {
    return term_1045;
  }
  expandCallExpression(term_1046) {
    let callee_1047 = this.expand(term_1046.callee);
    let enf_1048 = new _enforester.Enforester(term_1046.arguments, (0, _immutable.List)(), this.context);
    let args_1049 = enf_1048.enforestArgumentList().map(arg_1050 => this.expand(arg_1050));
    return new _terms2.default("CallExpression", { callee: callee_1047, arguments: args_1049 });
  }
  expandSpreadElement(term_1051) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1051.expression) });
  }
  expandExpressionStatement(term_1052) {
    let child_1053 = this.expand(term_1052.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1053 });
  }
  expandLabeledStatement(term_1054) {
    return new _terms2.default("LabeledStatement", { label: term_1054.label.val(), body: this.expand(term_1054.body) });
  }
  doFunctionExpansion(term_1055, type_1056) {
    let scope_1057 = (0, _scope.freshScope)("fun");
    let red_1058 = new _applyScopeInParamsReducer2.default(scope_1057, this.context);
    let params_1059;
    if (type_1056 !== "Getter" && type_1056 !== "Setter") {
      params_1059 = red_1058.transform(term_1055.params);
      params_1059 = this.expand(params_1059);
    }
    this.context.currentScope.push(scope_1057);
    let compiler_1060 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1061, bodyTerm_1062;
    if (term_1055.body instanceof _terms2.default) {
      bodyTerm_1062 = this.expand(term_1055.body.addScope(scope_1057, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1061 = term_1055.body.map(b_1063 => b_1063.addScope(scope_1057, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1062 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1060.compile(markedBody_1061) });
    }
    this.context.currentScope.pop();
    if (type_1056 === "Getter") {
      return new _terms2.default(type_1056, { name: this.expand(term_1055.name), body: bodyTerm_1062 });
    } else if (type_1056 === "Setter") {
      return new _terms2.default(type_1056, { name: this.expand(term_1055.name), param: term_1055.param, body: bodyTerm_1062 });
    }
    return new _terms2.default(type_1056, { name: term_1055.name, isGenerator: term_1055.isGenerator, params: params_1059, body: bodyTerm_1062 });
  }
  expandMethod(term_1064) {
    return this.doFunctionExpansion(term_1064, "Method");
  }
  expandSetter(term_1065) {
    return this.doFunctionExpansion(term_1065, "Setter");
  }
  expandGetter(term_1066) {
    return this.doFunctionExpansion(term_1066, "Getter");
  }
  expandFunctionDeclaration(term_1067) {
    return this.doFunctionExpansion(term_1067, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1068) {
    return this.doFunctionExpansion(term_1068, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1069) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1069.binding), operator: term_1069.operator, expression: this.expand(term_1069.expression) });
  }
  expandAssignmentExpression(term_1070) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1070.binding), expression: this.expand(term_1070.expression) });
  }
  expandEmptyStatement(term_1071) {
    return term_1071;
  }
  expandLiteralBooleanExpression(term_1072) {
    return term_1072;
  }
  expandLiteralNumericExpression(term_1073) {
    return term_1073;
  }
  expandLiteralInfinityExpression(term_1074) {
    return term_1074;
  }
  expandIdentifierExpression(term_1075) {
    let trans_1076 = this.context.env.get(term_1075.name.resolve(this.context.phase));
    if (trans_1076) {
      return new _terms2.default("IdentifierExpression", { name: trans_1076.id });
    }
    return term_1075;
  }
  expandLiteralNullExpression(term_1077) {
    return term_1077;
  }
  expandLiteralStringExpression(term_1078) {
    return term_1078;
  }
  expandLiteralRegExpExpression(term_1079) {
    return term_1079;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUFQLEVBQW1DLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUF6QyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsUUFBcEIsRUFBOEI7QUFDNUIsV0FBTyxvQkFBUyxlQUFULEVBQTBC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UyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQTdVcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MzYpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkzNjtcbiAgfVxuICBleHBhbmQodGVybV85MzcpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaCh0ZXJtXzkzNyk7XG4gIH1cbiAgZXhwYW5kUHJhZ21hKHRlcm1fOTM4KSB7XG4gICAgcmV0dXJuIHRlcm1fOTM4O1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzkzOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzkzOS50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzkzOS50YWcpLCBlbGVtZW50czogdGVybV85MzkuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV85NDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTQwLmxhYmVsID8gdGVybV85NDAubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzk0MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTQxLmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk0MS50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV85NDIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk0Mi5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk0Mi5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV85NDMpIHtcbiAgICByZXR1cm4gdGVybV85NDM7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV85NDQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTQ0LmxhYmVsID8gdGVybV85NDQubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV85NDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzk0NS5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fOTQ1LnByZURlZmF1bHRDYXNlcy5tYXAoY185NDYgPT4gdGhpcy5leHBhbmQoY185NDYpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk0NS5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fOTQ1LnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfOTQ3ID0+IHRoaXMuZXhwYW5kKGNfOTQ3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fOTQ4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fOTQ4Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTQ4LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fOTQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTQ5LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzk0OS5jYXNlcy5tYXAoY185NTAgPT4gdGhpcy5leHBhbmQoY185NTApKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fOTUxKSB7XG4gICAgbGV0IHJlc3RfOTUyID0gdGVybV85NTEucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTUxLnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzk1MS5pdGVtcy5tYXAoaV85NTMgPT4gdGhpcy5leHBhbmQoaV85NTMpKSwgcmVzdDogcmVzdF85NTJ9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV85NTQpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fOTU0LCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fOTU1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV85NTUuY29uc2VxdWVudC5tYXAoY185NTYgPT4gdGhpcy5leHBhbmQoY185NTYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fOTU3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85NTcudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fOTU3LmNvbnNlcXVlbnQubWFwKGNfOTU4ID0+IHRoaXMuZXhwYW5kKGNfOTU4KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV85NTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV85NTkubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzk1OS5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTU5LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV85NjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV85NjAuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk2MC5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fOTYxKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzk2MiA9IHRlcm1fOTYxLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85NjEuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTYxLmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfOTYyLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fOTYxLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzk2Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzk2My5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV85NjMuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzk2NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzk2NC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fOTY1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTY1LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV85NjUucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk2NS5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fOTY2KSB7XG4gICAgcmV0dXJuIHRlcm1fOTY2O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV85NjcpIHtcbiAgICByZXR1cm4gdGVybV85Njc7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV85NjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV85NjgubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTY4LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV85NjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV85NjkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fOTcwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV85NzAucHJvcGVydGllcy5tYXAodF85NzEgPT4gdGhpcy5leHBhbmQodF85NzEpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV85NzIpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfOTczID0gdGVybV85NzIucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk3Mi5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV85NzIuZWxlbWVudHMubWFwKHRfOTc0ID0+IHRfOTc0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF85NzQpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF85NzN9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV85NzUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTc1LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzk3NS5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fOTc2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fOTc2Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV85NzYubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fOTc3KSB7XG4gICAgbGV0IGluaXRfOTc4ID0gdGVybV85NzcuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTc3LmluaXQpO1xuICAgIGxldCB0ZXN0Xzk3OSA9IHRlcm1fOTc3LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk3Ny50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzk4MCA9IHRlcm1fOTc3LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTc3LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfOTgxID0gdGhpcy5leHBhbmQodGVybV85NzcuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzk3OCwgdGVzdDogdGVzdF85NzksIHVwZGF0ZTogdXBkYXRlXzk4MCwgYm9keTogYm9keV85ODF9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV85ODIpIHtcbiAgICBsZXQgZXhwcl85ODMgPSB0ZXJtXzk4Mi5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85ODIuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzk4M30pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzk4NCkge1xuICAgIGxldCBleHByXzk4NSA9IHRlcm1fOTg0LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4NC5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfOTg1fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV85ODYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85ODYudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTg2LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV85ODcpIHtcbiAgICBsZXQgY29uc2VxdWVudF85ODggPSB0ZXJtXzk4Ny5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85ODcuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV85ODkgPSB0ZXJtXzk4Ny5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4Ny5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk4Ny50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF85ODgsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk4OX0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fOTkwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzk5MC5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzk5MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzk5MS5zdGF0ZW1lbnRzLm1hcChzXzk5MiA9PiB0aGlzLmV4cGFuZChzXzk5MikpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV85OTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV85OTMuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fOTk0KSB7XG4gICAgaWYgKHRlcm1fOTk0LmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fOTk0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTk0LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzk5NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fOTk1Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5NS5uYW1lKSwgc3VwZXI6IHRlcm1fOTk1LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTUuc3VwZXIpLCBlbGVtZW50czogdGVybV85OTUuZWxlbWVudHMubWFwKGVsXzk5NiA9PiB0aGlzLmV4cGFuZChlbF85OTYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV85OTcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fOTk3Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5Ny5uYW1lKSwgc3VwZXI6IHRlcm1fOTk3LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTcuc3VwZXIpLCBlbGVtZW50czogdGVybV85OTcuZWxlbWVudHMubWFwKGVsXzk5OCA9PiB0aGlzLmV4cGFuZChlbF85OTgpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV85OTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzk5OS5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzk5OS5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV8xMDAwKSB7XG4gICAgcmV0dXJuIHRlcm1fMTAwMDtcbiAgfVxuICBleHBhbmRTeW50YXhUZW1wbGF0ZSh0ZXJtXzEwMDEpIHtcbiAgICBsZXQgcl8xMDAyID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fMTAwMS50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzEwMDMgPSBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHJfMTAwMi50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfMTAwNCA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCBcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc18xMDA1ID0gcl8xMDAyLmludGVycC5tYXAoaV8xMDA3ID0+IHtcbiAgICAgIGxldCBlbmZfMTAwOCA9IG5ldyBFbmZvcmVzdGVyKGlfMTAwNywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl8xMDA4LmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKSk7XG4gICAgfSk7XG4gICAgbGV0IGFyZ3NfMTAwNiA9IExpc3Qub2YobmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHN0cl8xMDAzfSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfMTAwNSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwMDQsIGFyZ3VtZW50czogYXJnc18xMDA2fSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV8xMDA5KSB7XG4gICAgbGV0IHN0cl8xMDEwID0gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHNlcmlhbGl6ZXIud3JpdGUodGVybV8xMDA5Lm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzEwMDkudGVtcGxhdGUudGFnLCBlbGVtZW50czogdGVybV8xMDA5LnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyXzEwMTApLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV8xMDExKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTEub2JqZWN0KSwgcHJvcGVydHk6IHRlcm1fMTAxMS5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzEwMTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiB0ZXJtXzEwMTIuZWxlbWVudHMubWFwKHRfMTAxMyA9PiB0XzEwMTMgPT0gbnVsbCA/IHRfMTAxMyA6IHRoaXMuZXhwYW5kKHRfMTAxMykpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fMTAxNCkge1xuICAgIHJldHVybiB0ZXJtXzEwMTQ7XG4gIH1cbiAgZXhwYW5kSW1wb3J0TmFtZXNwYWNlKHRlcm1fMTAxNSkge1xuICAgIHJldHVybiB0ZXJtXzEwMTU7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fMTAxNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fMTAxNi5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fMTAxNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNy5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydEZyb20odGVybV8xMDE4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTAxODtcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fMTAxOSkge1xuICAgIHJldHVybiB0ZXJtXzEwMTk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fMTAyMCkge1xuICAgIHJldHVybiB0ZXJtXzEwMjA7XG4gIH1cbiAgZXhwYW5kU3RhdGljUHJvcGVydHlOYW1lKHRlcm1fMTAyMSkge1xuICAgIHJldHVybiB0ZXJtXzEwMjE7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fMTAyMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDIyLm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjIuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fMTAyMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHRlcm1fMTAyMy5wcm9wZXJ0aWVzLm1hcCh0XzEwMjQgPT4gdGhpcy5leHBhbmQodF8xMDI0KSl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybV8xMDI1KSB7XG4gICAgbGV0IGluaXRfMTAyNiA9IHRlcm1fMTAyNS5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDI1LmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDI1LmJpbmRpbmcpLCBpbml0OiBpbml0XzEwMjZ9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fMTAyNykge1xuICAgIGlmICh0ZXJtXzEwMjcua2luZCA9PT0gXCJzeW50YXhcIiB8fCB0ZXJtXzEwMjcua2luZCA9PT0gXCJzeW50YXhyZWNcIikge1xuICAgICAgcmV0dXJuIHRlcm1fMTAyNztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDogdGVybV8xMDI3LmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzEwMjcuZGVjbGFyYXRvcnMubWFwKGRfMTAyOCA9PiB0aGlzLmV4cGFuZChkXzEwMjgpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fMTAyOSkge1xuICAgIGlmICh0ZXJtXzEwMjkuaW5uZXIuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBlbmQgb2YgaW5wdXRcIik7XG4gICAgfVxuICAgIGxldCBlbmZfMTAzMCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTAyOS5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTAzMSA9IGVuZl8xMDMwLnBlZWsoKTtcbiAgICBsZXQgdF8xMDMyID0gZW5mXzEwMzAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRfMTAzMiA9PSBudWxsIHx8IGVuZl8xMDMwLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZl8xMDMwLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMDMxLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF8xMDMyKTtcbiAgfVxuICBleHBhbmRVbmFyeUV4cHJlc3Npb24odGVybV8xMDMzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVW5hcnlFeHByZXNzaW9uXCIsIHtvcGVyYXRvcjogdGVybV8xMDMzLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzMub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRVcGRhdGVFeHByZXNzaW9uKHRlcm1fMTAzNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiB0ZXJtXzEwMzQuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzEwMzQub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNC5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZEJpbmFyeUV4cHJlc3Npb24odGVybV8xMDM1KSB7XG4gICAgbGV0IGxlZnRfMTAzNiA9IHRoaXMuZXhwYW5kKHRlcm1fMTAzNS5sZWZ0KTtcbiAgICBsZXQgcmlnaHRfMTAzNyA9IHRoaXMuZXhwYW5kKHRlcm1fMTAzNS5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xMDM2LCBvcGVyYXRvcjogdGVybV8xMDM1Lm9wZXJhdG9yLCByaWdodDogcmlnaHRfMTAzN30pO1xuICB9XG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtXzEwMzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAzOC50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV8xMDM4LmNvbnNlcXVlbnQpLCBhbHRlcm5hdGU6IHRoaXMuZXhwYW5kKHRlcm1fMTAzOC5hbHRlcm5hdGUpfSk7XG4gIH1cbiAgZXhwYW5kTmV3VGFyZ2V0RXhwcmVzc2lvbih0ZXJtXzEwMzkpIHtcbiAgICByZXR1cm4gdGVybV8xMDM5O1xuICB9XG4gIGV4cGFuZE5ld0V4cHJlc3Npb24odGVybV8xMDQwKSB7XG4gICAgbGV0IGNhbGxlZV8xMDQxID0gdGhpcy5leHBhbmQodGVybV8xMDQwLmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDQyID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDQwLmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNDMgPSBlbmZfMTA0Mi5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA0NCA9PiB0aGlzLmV4cGFuZChhcmdfMTA0NCkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwNDEsIGFyZ3VtZW50czogYXJnc18xMDQzLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fMTA0NSkge1xuICAgIHJldHVybiB0ZXJtXzEwNDU7XG4gIH1cbiAgZXhwYW5kQ2FsbEV4cHJlc3Npb24odGVybV8xMDQ2KSB7XG4gICAgbGV0IGNhbGxlZV8xMDQ3ID0gdGhpcy5leHBhbmQodGVybV8xMDQ2LmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDQ4ID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDQ2LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNDkgPSBlbmZfMTA0OC5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA1MCA9PiB0aGlzLmV4cGFuZChhcmdfMTA1MCkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDQ3LCBhcmd1bWVudHM6IGFyZ3NfMTA0OX0pO1xuICB9XG4gIGV4cGFuZFNwcmVhZEVsZW1lbnQodGVybV8xMDUxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDUxLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzEwNTIpIHtcbiAgICBsZXQgY2hpbGRfMTA1MyA9IHRoaXMuZXhwYW5kKHRlcm1fMTA1Mi5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF8xMDUzfSk7XG4gIH1cbiAgZXhwYW5kTGFiZWxlZFN0YXRlbWVudCh0ZXJtXzEwNTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV8xMDU0LmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTQuYm9keSl9KTtcbiAgfVxuICBkb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA1NSwgdHlwZV8xMDU2KSB7XG4gICAgbGV0IHNjb3BlXzEwNTcgPSBmcmVzaFNjb3BlKFwiZnVuXCIpO1xuICAgIGxldCByZWRfMTA1OCA9IG5ldyBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyKHNjb3BlXzEwNTcsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc18xMDU5O1xuICAgIGlmICh0eXBlXzEwNTYgIT09IFwiR2V0dGVyXCIgJiYgdHlwZV8xMDU2ICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfMTA1OSA9IHJlZF8xMDU4LnRyYW5zZm9ybSh0ZXJtXzEwNTUucGFyYW1zKTtcbiAgICAgIHBhcmFtc18xMDU5ID0gdGhpcy5leHBhbmQocGFyYW1zXzEwNTkpO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfMTA1Nyk7XG4gICAgbGV0IGNvbXBpbGVyXzEwNjAgPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfMTA2MSwgYm9keVRlcm1fMTA2MjtcbiAgICBpZiAodGVybV8xMDU1LmJvZHkgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICBib2R5VGVybV8xMDYyID0gdGhpcy5leHBhbmQodGVybV8xMDU1LmJvZHkuYWRkU2NvcGUoc2NvcGVfMTA1NywgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlZEJvZHlfMTA2MSA9IHRlcm1fMTA1NS5ib2R5Lm1hcChiXzEwNjMgPT4gYl8xMDYzLmFkZFNjb3BlKHNjb3BlXzEwNTcsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgICAgYm9keVRlcm1fMTA2MiA9IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0KCksIHN0YXRlbWVudHM6IGNvbXBpbGVyXzEwNjAuY29tcGlsZShtYXJrZWRCb2R5XzEwNjEpfSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucG9wKCk7XG4gICAgaWYgKHR5cGVfMTA1NiA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1Niwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTA1NS5uYW1lKSwgYm9keTogYm9keVRlcm1fMTA2Mn0pO1xuICAgIH0gZWxzZSBpZiAodHlwZV8xMDU2ID09PSBcIlNldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDU2LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDU1Lm5hbWUpLCBwYXJhbTogdGVybV8xMDU1LnBhcmFtLCBib2R5OiBib2R5VGVybV8xMDYyfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNTYsIHtuYW1lOiB0ZXJtXzEwNTUubmFtZSwgaXNHZW5lcmF0b3I6IHRlcm1fMTA1NS5pc0dlbmVyYXRvciwgcGFyYW1zOiBwYXJhbXNfMTA1OSwgYm9keTogYm9keVRlcm1fMTA2Mn0pO1xuICB9XG4gIGV4cGFuZE1ldGhvZCh0ZXJtXzEwNjQpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA2NCwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fMTA2NSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDY1LCBcIlNldHRlclwiKTtcbiAgfVxuICBleHBhbmRHZXR0ZXIodGVybV8xMDY2KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjYsIFwiR2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV8xMDY3KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjcsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV8xMDY4KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjgsIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZENvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV8xMDY5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDY5LmJpbmRpbmcpLCBvcGVyYXRvcjogdGVybV8xMDY5Lm9wZXJhdG9yLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNjkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzEwNzApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDcwLmJpbmRpbmcpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzEwNzEpIHtcbiAgICByZXR1cm4gdGVybV8xMDcxO1xuICB9XG4gIGV4cGFuZExpdGVyYWxCb29sZWFuRXhwcmVzc2lvbih0ZXJtXzEwNzIpIHtcbiAgICByZXR1cm4gdGVybV8xMDcyO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdW1lcmljRXhwcmVzc2lvbih0ZXJtXzEwNzMpIHtcbiAgICByZXR1cm4gdGVybV8xMDczO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV8xMDc0KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3NDtcbiAgfVxuICBleHBhbmRJZGVudGlmaWVyRXhwcmVzc2lvbih0ZXJtXzEwNzUpIHtcbiAgICBsZXQgdHJhbnNfMTA3NiA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMTA3NS5uYW1lLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSk7XG4gICAgaWYgKHRyYW5zXzEwNzYpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc18xMDc2LmlkfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtXzEwNzU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bGxFeHByZXNzaW9uKHRlcm1fMTA3Nykge1xuICAgIHJldHVybiB0ZXJtXzEwNzc7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24odGVybV8xMDc4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3ODtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzEwNzkpIHtcbiAgICByZXR1cm4gdGVybV8xMDc5O1xuICB9XG59XG4iXX0=