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
  constructor(context_937) {
    super("expand", true);
    this.context = context_937;
  }
  expand(term_938) {
    return this.dispatch(term_938);
  }
  expandPragma(term_939) {
    return term_939;
  }
  expandTemplateExpression(term_940) {
    return new _terms2.default("TemplateExpression", { tag: term_940.tag == null ? null : this.expand(term_940.tag), elements: term_940.elements.toArray() });
  }
  expandBreakStatement(term_941) {
    return new _terms2.default("BreakStatement", { label: term_941.label ? term_941.label.val() : null });
  }
  expandDoWhileStatement(term_942) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_942.body), test: this.expand(term_942.test) });
  }
  expandWithStatement(term_943) {
    return new _terms2.default("WithStatement", { body: this.expand(term_943.body), object: this.expand(term_943.object) });
  }
  expandDebuggerStatement(term_944) {
    return term_944;
  }
  expandContinueStatement(term_945) {
    return new _terms2.default("ContinueStatement", { label: term_945.label ? term_945.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_946) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_946.discriminant), preDefaultCases: term_946.preDefaultCases.map(c_947 => this.expand(c_947)).toArray(), defaultCase: this.expand(term_946.defaultCase), postDefaultCases: term_946.postDefaultCases.map(c_948 => this.expand(c_948)).toArray() });
  }
  expandComputedMemberExpression(term_949) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_949.object), expression: this.expand(term_949.expression) });
  }
  expandSwitchStatement(term_950) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_950.discriminant), cases: term_950.cases.map(c_951 => this.expand(c_951)).toArray() });
  }
  expandFormalParameters(term_952) {
    let rest_953 = term_952.rest == null ? null : this.expand(term_952.rest);
    return new _terms2.default("FormalParameters", { items: term_952.items.map(i_954 => this.expand(i_954)), rest: rest_953 });
  }
  expandArrowExpression(term_955) {
    return this.doFunctionExpansion(term_955, "ArrowExpression");
  }
  expandSwitchDefault(term_956) {
    return new _terms2.default("SwitchDefault", { consequent: term_956.consequent.map(c_957 => this.expand(c_957)).toArray() });
  }
  expandSwitchCase(term_958) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_958.test), consequent: term_958.consequent.map(c_959 => this.expand(c_959)).toArray() });
  }
  expandForInStatement(term_960) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_960.left), right: this.expand(term_960.right), body: this.expand(term_960.body) });
  }
  expandTryCatchStatement(term_961) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_961.body), catchClause: this.expand(term_961.catchClause) });
  }
  expandTryFinallyStatement(term_962) {
    let catchClause_963 = term_962.catchClause == null ? null : this.expand(term_962.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_962.body), catchClause: catchClause_963, finalizer: this.expand(term_962.finalizer) });
  }
  expandCatchClause(term_964) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_964.binding), body: this.expand(term_964.body) });
  }
  expandThrowStatement(term_965) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_965.expression) });
  }
  expandForOfStatement(term_966) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_966.left), right: this.expand(term_966.right), body: this.expand(term_966.body) });
  }
  expandBindingIdentifier(term_967) {
    return term_967;
  }
  expandBindingPropertyIdentifier(term_968) {
    return term_968;
  }
  expandBindingPropertyProperty(term_969) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_969.name), binding: this.expand(term_969.binding) });
  }
  expandComputedPropertyName(term_970) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_970.expression) });
  }
  expandObjectBinding(term_971) {
    return new _terms2.default("ObjectBinding", { properties: term_971.properties.map(t_972 => this.expand(t_972)).toArray() });
  }
  expandArrayBinding(term_973) {
    let restElement_974 = term_973.restElement == null ? null : this.expand(term_973.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_973.elements.map(t_975 => t_975 == null ? null : this.expand(t_975)).toArray(), restElement: restElement_974 });
  }
  expandBindingWithDefault(term_976) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_976.binding), init: this.expand(term_976.init) });
  }
  expandShorthandProperty(term_977) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_977.name }), expression: new _terms2.default("IdentifierExpression", { name: term_977.name }) });
  }
  expandForStatement(term_978) {
    let init_979 = term_978.init == null ? null : this.expand(term_978.init);
    let test_980 = term_978.test == null ? null : this.expand(term_978.test);
    let update_981 = term_978.update == null ? null : this.expand(term_978.update);
    let body_982 = this.expand(term_978.body);
    return new _terms2.default("ForStatement", { init: init_979, test: test_980, update: update_981, body: body_982 });
  }
  expandYieldExpression(term_983) {
    let expr_984 = term_983.expression == null ? null : this.expand(term_983.expression);
    return new _terms2.default("YieldExpression", { expression: expr_984 });
  }
  expandYieldGeneratorExpression(term_985) {
    let expr_986 = term_985.expression == null ? null : this.expand(term_985.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_986 });
  }
  expandWhileStatement(term_987) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_987.test), body: this.expand(term_987.body) });
  }
  expandIfStatement(term_988) {
    let consequent_989 = term_988.consequent == null ? null : this.expand(term_988.consequent);
    let alternate_990 = term_988.alternate == null ? null : this.expand(term_988.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_988.test), consequent: consequent_989, alternate: alternate_990 });
  }
  expandBlockStatement(term_991) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_991.block) });
  }
  expandBlock(term_992) {
    return new _terms2.default("Block", { statements: term_992.statements.map(s_993 => this.expand(s_993)).toArray() });
  }
  expandVariableDeclarationStatement(term_994) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_994.declaration) });
  }
  expandReturnStatement(term_995) {
    if (term_995.expression == null) {
      return term_995;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_995.expression) });
  }
  expandClassDeclaration(term_996) {
    return new _terms2.default("ClassDeclaration", { name: term_996.name == null ? null : this.expand(term_996.name), super: term_996.super == null ? null : this.expand(term_996.super), elements: term_996.elements.map(el_997 => this.expand(el_997)).toArray() });
  }
  expandClassExpression(term_998) {
    return new _terms2.default("ClassExpression", { name: term_998.name == null ? null : this.expand(term_998.name), super: term_998.super == null ? null : this.expand(term_998.super), elements: term_998.elements.map(el_999 => this.expand(el_999)).toArray() });
  }
  expandClassElement(term_1000) {
    return new _terms2.default("ClassElement", { isStatic: term_1000.isStatic, method: this.expand(term_1000.method) });
  }
  expandThisExpression(term_1001) {
    return term_1001;
  }
  expandSyntaxTemplate(term_1002) {
    let r_1003 = (0, _templateProcessor.processTemplate)(term_1002.template.inner());
    let str_1004 = _syntax2.default.from("string", _serializer.serializer.write(r_1003.template));
    let callee_1005 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1006 = r_1003.interp.map(i_1008 => {
      let enf_1009 = new _enforester.Enforester(i_1008, (0, _immutable.List)(), this.context);
      return this.expand(enf_1009.enforest("expression"));
    });
    let args_1007 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1004 })).concat(expandedInterps_1006);
    return new _terms2.default("CallExpression", { callee: callee_1005, arguments: args_1007 });
  }
  expandSyntaxQuote(term_1010) {
    let str_1011 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1010.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1010.template.tag, elements: term_1010.template.elements.push(str_1011).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1012) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1012.object), property: term_1012.property });
  }
  expandArrayExpression(term_1013) {
    return new _terms2.default("ArrayExpression", { elements: term_1013.elements.map(t_1014 => t_1014 == null ? t_1014 : this.expand(t_1014)) });
  }
  expandImport(term_1015) {
    return term_1015;
  }
  expandImportNamespace(term_1016) {
    return term_1016;
  }
  expandExport(term_1017) {
    return new _terms2.default("Export", { declaration: this.expand(term_1017.declaration) });
  }
  expandExportDefault(term_1018) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1018.body) });
  }
  expandExportFrom(term_1019) {
    return term_1019;
  }
  expandExportAllFrom(term_1020) {
    return term_1020;
  }
  expandExportSpecifier(term_1021) {
    return term_1021;
  }
  expandStaticPropertyName(term_1022) {
    return term_1022;
  }
  expandDataProperty(term_1023) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1023.name), expression: this.expand(term_1023.expression) });
  }
  expandObjectExpression(term_1024) {
    return new _terms2.default("ObjectExpression", { properties: term_1024.properties.map(t_1025 => this.expand(t_1025)) });
  }
  expandVariableDeclarator(term_1026) {
    let init_1027 = term_1026.init == null ? null : this.expand(term_1026.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1026.binding), init: init_1027 });
  }
  expandVariableDeclaration(term_1028) {
    if (term_1028.kind === "syntax" || term_1028.kind === "syntaxrec") {
      return term_1028;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1028.kind, declarators: term_1028.declarators.map(d_1029 => this.expand(d_1029)) });
  }
  expandParenthesizedExpression(term_1030) {
    if (term_1030.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1031 = new _enforester.Enforester(term_1030.inner, (0, _immutable.List)(), this.context);
    let lookahead_1032 = enf_1031.peek();
    let t_1033 = enf_1031.enforestExpression();
    if (t_1033 == null || enf_1031.rest.size > 0) {
      throw enf_1031.createError(lookahead_1032, "unexpected syntax");
    }
    return this.expand(t_1033);
  }
  expandUnaryExpression(term_1034) {
    return new _terms2.default("UnaryExpression", { operator: term_1034.operator, operand: this.expand(term_1034.operand) });
  }
  expandUpdateExpression(term_1035) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1035.isPrefix, operator: term_1035.operator, operand: this.expand(term_1035.operand) });
  }
  expandBinaryExpression(term_1036) {
    let left_1037 = this.expand(term_1036.left);
    let right_1038 = this.expand(term_1036.right);
    return new _terms2.default("BinaryExpression", { left: left_1037, operator: term_1036.operator, right: right_1038 });
  }
  expandConditionalExpression(term_1039) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1039.test), consequent: this.expand(term_1039.consequent), alternate: this.expand(term_1039.alternate) });
  }
  expandNewTargetExpression(term_1040) {
    return term_1040;
  }
  expandNewExpression(term_1041) {
    let callee_1042 = this.expand(term_1041.callee);
    let enf_1043 = new _enforester.Enforester(term_1041.arguments, (0, _immutable.List)(), this.context);
    let args_1044 = enf_1043.enforestArgumentList().map(arg_1045 => this.expand(arg_1045));
    return new _terms2.default("NewExpression", { callee: callee_1042, arguments: args_1044.toArray() });
  }
  expandSuper(term_1046) {
    return term_1046;
  }
  expandCallExpression(term_1047) {
    let callee_1048 = this.expand(term_1047.callee);
    let enf_1049 = new _enforester.Enforester(term_1047.arguments, (0, _immutable.List)(), this.context);
    let args_1050 = enf_1049.enforestArgumentList().map(arg_1051 => this.expand(arg_1051));
    return new _terms2.default("CallExpression", { callee: callee_1048, arguments: args_1050 });
  }
  expandSpreadElement(term_1052) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1052.expression) });
  }
  expandExpressionStatement(term_1053) {
    let child_1054 = this.expand(term_1053.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1054 });
  }
  expandLabeledStatement(term_1055) {
    return new _terms2.default("LabeledStatement", { label: term_1055.label.val(), body: this.expand(term_1055.body) });
  }
  doFunctionExpansion(term_1056, type_1057) {
    let scope_1058 = (0, _scope.freshScope)("fun");
    let red_1059 = new _applyScopeInParamsReducer2.default(scope_1058, this.context);
    let params_1060;
    if (type_1057 !== "Getter" && type_1057 !== "Setter") {
      params_1060 = red_1059.transform(term_1056.params);
      params_1060 = this.expand(params_1060);
    }
    this.context.currentScope.push(scope_1058);
    let compiler_1061 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1062, bodyTerm_1063;
    if (term_1056.body instanceof _terms2.default) {
      bodyTerm_1063 = this.expand(term_1056.body.addScope(scope_1058, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1062 = term_1056.body.map(b_1064 => b_1064.addScope(scope_1058, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1063 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1061.compile(markedBody_1062) });
    }
    this.context.currentScope.pop();
    if (type_1057 === "Getter") {
      return new _terms2.default(type_1057, { name: this.expand(term_1056.name), body: bodyTerm_1063 });
    } else if (type_1057 === "Setter") {
      return new _terms2.default(type_1057, { name: this.expand(term_1056.name), param: term_1056.param, body: bodyTerm_1063 });
    }
    return new _terms2.default(type_1057, { name: term_1056.name, isGenerator: term_1056.isGenerator, params: params_1060, body: bodyTerm_1063 });
  }
  expandMethod(term_1065) {
    return this.doFunctionExpansion(term_1065, "Method");
  }
  expandSetter(term_1066) {
    return this.doFunctionExpansion(term_1066, "Setter");
  }
  expandGetter(term_1067) {
    return this.doFunctionExpansion(term_1067, "Getter");
  }
  expandFunctionDeclaration(term_1068) {
    return this.doFunctionExpansion(term_1068, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1069) {
    return this.doFunctionExpansion(term_1069, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1070) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1070.binding), operator: term_1070.operator, expression: this.expand(term_1070.expression) });
  }
  expandAssignmentExpression(term_1071) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1071.binding), expression: this.expand(term_1071.expression) });
  }
  expandEmptyStatement(term_1072) {
    return term_1072;
  }
  expandLiteralBooleanExpression(term_1073) {
    return term_1073;
  }
  expandLiteralNumericExpression(term_1074) {
    return term_1074;
  }
  expandLiteralInfinityExpression(term_1075) {
    return term_1075;
  }
  expandIdentifierExpression(term_1076) {
    let trans_1077 = this.context.env.get(term_1076.name.resolve(this.context.phase));
    if (trans_1077) {
      return new _terms2.default("IdentifierExpression", { name: trans_1077.id });
    }
    return term_1076;
  }
  expandLiteralNullExpression(term_1078) {
    return term_1078;
  }
  expandLiteralStringExpression(term_1079) {
    return term_1079;
  }
  expandLiteralRegExpExpression(term_1080) {
    return term_1080;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUFQLEVBQW1DLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUF6QyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsUUFBcEIsRUFBOEI7QUFDNUIsV0FBTyxvQkFBUyxlQUFULEVBQTBC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UyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQTdVcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MzcpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkzNztcbiAgfVxuICBleHBhbmQodGVybV85MzgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaCh0ZXJtXzkzOCk7XG4gIH1cbiAgZXhwYW5kUHJhZ21hKHRlcm1fOTM5KSB7XG4gICAgcmV0dXJuIHRlcm1fOTM5O1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzk0MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzk0MC50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk0MC50YWcpLCBlbGVtZW50czogdGVybV85NDAuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV85NDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTQxLmxhYmVsID8gdGVybV85NDEubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzk0Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTQyLmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk0Mi50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV85NDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk0My5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk0My5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV85NDQpIHtcbiAgICByZXR1cm4gdGVybV85NDQ7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV85NDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTQ1LmxhYmVsID8gdGVybV85NDUubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV85NDYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzk0Ni5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fOTQ2LnByZURlZmF1bHRDYXNlcy5tYXAoY185NDcgPT4gdGhpcy5leHBhbmQoY185NDcpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk0Ni5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fOTQ2LnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfOTQ4ID0+IHRoaXMuZXhwYW5kKGNfOTQ4KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fOTQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fOTQ5Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTQ5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fOTUwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTUwLmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzk1MC5jYXNlcy5tYXAoY185NTEgPT4gdGhpcy5leHBhbmQoY185NTEpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fOTUyKSB7XG4gICAgbGV0IHJlc3RfOTUzID0gdGVybV85NTIucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTUyLnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzk1Mi5pdGVtcy5tYXAoaV85NTQgPT4gdGhpcy5leHBhbmQoaV85NTQpKSwgcmVzdDogcmVzdF85NTN9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV85NTUpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fOTU1LCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fOTU2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV85NTYuY29uc2VxdWVudC5tYXAoY185NTcgPT4gdGhpcy5leHBhbmQoY185NTcpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fOTU4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85NTgudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fOTU4LmNvbnNlcXVlbnQubWFwKGNfOTU5ID0+IHRoaXMuZXhwYW5kKGNfOTU5KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV85NjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV85NjAubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzk2MC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTYwLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV85NjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV85NjEuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk2MS5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fOTYyKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzk2MyA9IHRlcm1fOTYyLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85NjIuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTYyLmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfOTYzLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fOTYyLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzk2NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzk2NC5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV85NjQuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzk2NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzk2NS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fOTY2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTY2LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV85NjYucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk2Ni5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fOTY3KSB7XG4gICAgcmV0dXJuIHRlcm1fOTY3O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV85NjgpIHtcbiAgICByZXR1cm4gdGVybV85Njg7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV85NjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV85NjkubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTY5LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV85NzApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV85NzAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fOTcxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV85NzEucHJvcGVydGllcy5tYXAodF85NzIgPT4gdGhpcy5leHBhbmQodF85NzIpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV85NzMpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfOTc0ID0gdGVybV85NzMucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk3My5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV85NzMuZWxlbWVudHMubWFwKHRfOTc1ID0+IHRfOTc1ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF85NzUpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF85NzR9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV85NzYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTc2LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzk3Ni5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fOTc3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fOTc3Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV85NzcubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fOTc4KSB7XG4gICAgbGV0IGluaXRfOTc5ID0gdGVybV85NzguaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTc4LmluaXQpO1xuICAgIGxldCB0ZXN0Xzk4MCA9IHRlcm1fOTc4LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk3OC50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzk4MSA9IHRlcm1fOTc4LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTc4LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfOTgyID0gdGhpcy5leHBhbmQodGVybV85NzguYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzk3OSwgdGVzdDogdGVzdF85ODAsIHVwZGF0ZTogdXBkYXRlXzk4MSwgYm9keTogYm9keV85ODJ9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV85ODMpIHtcbiAgICBsZXQgZXhwcl85ODQgPSB0ZXJtXzk4My5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85ODMuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzk4NH0pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzk4NSkge1xuICAgIGxldCBleHByXzk4NiA9IHRlcm1fOTg1LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4NS5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfOTg2fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV85ODcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85ODcudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTg3LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV85ODgpIHtcbiAgICBsZXQgY29uc2VxdWVudF85ODkgPSB0ZXJtXzk4OC5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85ODguY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV85OTAgPSB0ZXJtXzk4OC5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4OC5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk4OC50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF85ODksIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk5MH0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fOTkxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzk5MS5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzk5Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzk5Mi5zdGF0ZW1lbnRzLm1hcChzXzk5MyA9PiB0aGlzLmV4cGFuZChzXzk5MykpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV85OTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV85OTQuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fOTk1KSB7XG4gICAgaWYgKHRlcm1fOTk1LmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fOTk1O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTk1LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzk5Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fOTk2Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5Ni5uYW1lKSwgc3VwZXI6IHRlcm1fOTk2LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTYuc3VwZXIpLCBlbGVtZW50czogdGVybV85OTYuZWxlbWVudHMubWFwKGVsXzk5NyA9PiB0aGlzLmV4cGFuZChlbF85OTcpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV85OTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fOTk4Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5OC5uYW1lKSwgc3VwZXI6IHRlcm1fOTk4LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTguc3VwZXIpLCBlbGVtZW50czogdGVybV85OTguZWxlbWVudHMubWFwKGVsXzk5OSA9PiB0aGlzLmV4cGFuZChlbF85OTkpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV8xMDAwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogdGVybV8xMDAwLmlzU3RhdGljLCBtZXRob2Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAwMC5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV8xMDAxKSB7XG4gICAgcmV0dXJuIHRlcm1fMTAwMTtcbiAgfVxuICBleHBhbmRTeW50YXhUZW1wbGF0ZSh0ZXJtXzEwMDIpIHtcbiAgICBsZXQgcl8xMDAzID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fMTAwMi50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzEwMDQgPSBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHJfMTAwMy50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfMTAwNSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCBcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc18xMDA2ID0gcl8xMDAzLmludGVycC5tYXAoaV8xMDA4ID0+IHtcbiAgICAgIGxldCBlbmZfMTAwOSA9IG5ldyBFbmZvcmVzdGVyKGlfMTAwOCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl8xMDA5LmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKSk7XG4gICAgfSk7XG4gICAgbGV0IGFyZ3NfMTAwNyA9IExpc3Qub2YobmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHN0cl8xMDA0fSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfMTAwNik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwMDUsIGFyZ3VtZW50czogYXJnc18xMDA3fSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV8xMDEwKSB7XG4gICAgbGV0IHN0cl8xMDExID0gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHNlcmlhbGl6ZXIud3JpdGUodGVybV8xMDEwLm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzEwMTAudGVtcGxhdGUudGFnLCBlbGVtZW50czogdGVybV8xMDEwLnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyXzEwMTEpLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV8xMDEyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTIub2JqZWN0KSwgcHJvcGVydHk6IHRlcm1fMTAxMi5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzEwMTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiB0ZXJtXzEwMTMuZWxlbWVudHMubWFwKHRfMTAxNCA9PiB0XzEwMTQgPT0gbnVsbCA/IHRfMTAxNCA6IHRoaXMuZXhwYW5kKHRfMTAxNCkpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fMTAxNSkge1xuICAgIHJldHVybiB0ZXJtXzEwMTU7XG4gIH1cbiAgZXhwYW5kSW1wb3J0TmFtZXNwYWNlKHRlcm1fMTAxNikge1xuICAgIHJldHVybiB0ZXJtXzEwMTY7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fMTAxNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fMTAxNy5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fMTAxOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAxOC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydEZyb20odGVybV8xMDE5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTAxOTtcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fMTAyMCkge1xuICAgIHJldHVybiB0ZXJtXzEwMjA7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fMTAyMSkge1xuICAgIHJldHVybiB0ZXJtXzEwMjE7XG4gIH1cbiAgZXhwYW5kU3RhdGljUHJvcGVydHlOYW1lKHRlcm1fMTAyMikge1xuICAgIHJldHVybiB0ZXJtXzEwMjI7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fMTAyMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDIzLm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjMuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fMTAyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHRlcm1fMTAyNC5wcm9wZXJ0aWVzLm1hcCh0XzEwMjUgPT4gdGhpcy5leHBhbmQodF8xMDI1KSl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybV8xMDI2KSB7XG4gICAgbGV0IGluaXRfMTAyNyA9IHRlcm1fMTAyNi5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDI2LmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDI2LmJpbmRpbmcpLCBpbml0OiBpbml0XzEwMjd9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fMTAyOCkge1xuICAgIGlmICh0ZXJtXzEwMjgua2luZCA9PT0gXCJzeW50YXhcIiB8fCB0ZXJtXzEwMjgua2luZCA9PT0gXCJzeW50YXhyZWNcIikge1xuICAgICAgcmV0dXJuIHRlcm1fMTAyODtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDogdGVybV8xMDI4LmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzEwMjguZGVjbGFyYXRvcnMubWFwKGRfMTAyOSA9PiB0aGlzLmV4cGFuZChkXzEwMjkpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fMTAzMCkge1xuICAgIGlmICh0ZXJtXzEwMzAuaW5uZXIuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBlbmQgb2YgaW5wdXRcIik7XG4gICAgfVxuICAgIGxldCBlbmZfMTAzMSA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTAzMC5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTAzMiA9IGVuZl8xMDMxLnBlZWsoKTtcbiAgICBsZXQgdF8xMDMzID0gZW5mXzEwMzEuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRfMTAzMyA9PSBudWxsIHx8IGVuZl8xMDMxLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZl8xMDMxLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMDMyLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF8xMDMzKTtcbiAgfVxuICBleHBhbmRVbmFyeUV4cHJlc3Npb24odGVybV8xMDM0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVW5hcnlFeHByZXNzaW9uXCIsIHtvcGVyYXRvcjogdGVybV8xMDM0Lm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzQub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRVcGRhdGVFeHByZXNzaW9uKHRlcm1fMTAzNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiB0ZXJtXzEwMzUuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzEwMzUub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNS5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZEJpbmFyeUV4cHJlc3Npb24odGVybV8xMDM2KSB7XG4gICAgbGV0IGxlZnRfMTAzNyA9IHRoaXMuZXhwYW5kKHRlcm1fMTAzNi5sZWZ0KTtcbiAgICBsZXQgcmlnaHRfMTAzOCA9IHRoaXMuZXhwYW5kKHRlcm1fMTAzNi5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xMDM3LCBvcGVyYXRvcjogdGVybV8xMDM2Lm9wZXJhdG9yLCByaWdodDogcmlnaHRfMTAzOH0pO1xuICB9XG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtXzEwMzkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAzOS50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV8xMDM5LmNvbnNlcXVlbnQpLCBhbHRlcm5hdGU6IHRoaXMuZXhwYW5kKHRlcm1fMTAzOS5hbHRlcm5hdGUpfSk7XG4gIH1cbiAgZXhwYW5kTmV3VGFyZ2V0RXhwcmVzc2lvbih0ZXJtXzEwNDApIHtcbiAgICByZXR1cm4gdGVybV8xMDQwO1xuICB9XG4gIGV4cGFuZE5ld0V4cHJlc3Npb24odGVybV8xMDQxKSB7XG4gICAgbGV0IGNhbGxlZV8xMDQyID0gdGhpcy5leHBhbmQodGVybV8xMDQxLmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDQzID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDQxLmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNDQgPSBlbmZfMTA0My5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA0NSA9PiB0aGlzLmV4cGFuZChhcmdfMTA0NSkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwNDIsIGFyZ3VtZW50czogYXJnc18xMDQ0LnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fMTA0Nikge1xuICAgIHJldHVybiB0ZXJtXzEwNDY7XG4gIH1cbiAgZXhwYW5kQ2FsbEV4cHJlc3Npb24odGVybV8xMDQ3KSB7XG4gICAgbGV0IGNhbGxlZV8xMDQ4ID0gdGhpcy5leHBhbmQodGVybV8xMDQ3LmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDQ5ID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDQ3LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNTAgPSBlbmZfMTA0OS5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA1MSA9PiB0aGlzLmV4cGFuZChhcmdfMTA1MSkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDQ4LCBhcmd1bWVudHM6IGFyZ3NfMTA1MH0pO1xuICB9XG4gIGV4cGFuZFNwcmVhZEVsZW1lbnQodGVybV8xMDUyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDUyLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzEwNTMpIHtcbiAgICBsZXQgY2hpbGRfMTA1NCA9IHRoaXMuZXhwYW5kKHRlcm1fMTA1My5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF8xMDU0fSk7XG4gIH1cbiAgZXhwYW5kTGFiZWxlZFN0YXRlbWVudCh0ZXJtXzEwNTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV8xMDU1LmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTUuYm9keSl9KTtcbiAgfVxuICBkb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA1NiwgdHlwZV8xMDU3KSB7XG4gICAgbGV0IHNjb3BlXzEwNTggPSBmcmVzaFNjb3BlKFwiZnVuXCIpO1xuICAgIGxldCByZWRfMTA1OSA9IG5ldyBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyKHNjb3BlXzEwNTgsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc18xMDYwO1xuICAgIGlmICh0eXBlXzEwNTcgIT09IFwiR2V0dGVyXCIgJiYgdHlwZV8xMDU3ICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfMTA2MCA9IHJlZF8xMDU5LnRyYW5zZm9ybSh0ZXJtXzEwNTYucGFyYW1zKTtcbiAgICAgIHBhcmFtc18xMDYwID0gdGhpcy5leHBhbmQocGFyYW1zXzEwNjApO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfMTA1OCk7XG4gICAgbGV0IGNvbXBpbGVyXzEwNjEgPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfMTA2MiwgYm9keVRlcm1fMTA2MztcbiAgICBpZiAodGVybV8xMDU2LmJvZHkgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICBib2R5VGVybV8xMDYzID0gdGhpcy5leHBhbmQodGVybV8xMDU2LmJvZHkuYWRkU2NvcGUoc2NvcGVfMTA1OCwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlZEJvZHlfMTA2MiA9IHRlcm1fMTA1Ni5ib2R5Lm1hcChiXzEwNjQgPT4gYl8xMDY0LmFkZFNjb3BlKHNjb3BlXzEwNTgsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgICAgYm9keVRlcm1fMTA2MyA9IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0KCksIHN0YXRlbWVudHM6IGNvbXBpbGVyXzEwNjEuY29tcGlsZShtYXJrZWRCb2R5XzEwNjIpfSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucG9wKCk7XG4gICAgaWYgKHR5cGVfMTA1NyA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA1Nywge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTA1Ni5uYW1lKSwgYm9keTogYm9keVRlcm1fMTA2M30pO1xuICAgIH0gZWxzZSBpZiAodHlwZV8xMDU3ID09PSBcIlNldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDU3LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDU2Lm5hbWUpLCBwYXJhbTogdGVybV8xMDU2LnBhcmFtLCBib2R5OiBib2R5VGVybV8xMDYzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNTcsIHtuYW1lOiB0ZXJtXzEwNTYubmFtZSwgaXNHZW5lcmF0b3I6IHRlcm1fMTA1Ni5pc0dlbmVyYXRvciwgcGFyYW1zOiBwYXJhbXNfMTA2MCwgYm9keTogYm9keVRlcm1fMTA2M30pO1xuICB9XG4gIGV4cGFuZE1ldGhvZCh0ZXJtXzEwNjUpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA2NSwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fMTA2Nikge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDY2LCBcIlNldHRlclwiKTtcbiAgfVxuICBleHBhbmRHZXR0ZXIodGVybV8xMDY3KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjcsIFwiR2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV8xMDY4KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjgsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV8xMDY5KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjksIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZENvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV8xMDcwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDcwLmJpbmRpbmcpLCBvcGVyYXRvcjogdGVybV8xMDcwLm9wZXJhdG9yLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzEwNzEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDcxLmJpbmRpbmcpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzEuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzEwNzIpIHtcbiAgICByZXR1cm4gdGVybV8xMDcyO1xuICB9XG4gIGV4cGFuZExpdGVyYWxCb29sZWFuRXhwcmVzc2lvbih0ZXJtXzEwNzMpIHtcbiAgICByZXR1cm4gdGVybV8xMDczO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdW1lcmljRXhwcmVzc2lvbih0ZXJtXzEwNzQpIHtcbiAgICByZXR1cm4gdGVybV8xMDc0O1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV8xMDc1KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3NTtcbiAgfVxuICBleHBhbmRJZGVudGlmaWVyRXhwcmVzc2lvbih0ZXJtXzEwNzYpIHtcbiAgICBsZXQgdHJhbnNfMTA3NyA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMTA3Ni5uYW1lLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSk7XG4gICAgaWYgKHRyYW5zXzEwNzcpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc18xMDc3LmlkfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtXzEwNzY7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bGxFeHByZXNzaW9uKHRlcm1fMTA3OCkge1xuICAgIHJldHVybiB0ZXJtXzEwNzg7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24odGVybV8xMDc5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3OTtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzEwODApIHtcbiAgICByZXR1cm4gdGVybV8xMDgwO1xuICB9XG59XG4iXX0=