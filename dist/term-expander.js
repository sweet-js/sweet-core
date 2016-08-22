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
  constructor(context_999) {
    super("expand", true);
    this.context = context_999;
  }
  expand(term_1000) {
    return this.dispatch(term_1000);
  }
  expandPragma(term_1001) {
    return term_1001;
  }
  expandTemplateExpression(term_1002) {
    return new _terms2.default("TemplateExpression", { tag: term_1002.tag == null ? null : this.expand(term_1002.tag), elements: term_1002.elements.toArray() });
  }
  expandBreakStatement(term_1003) {
    return new _terms2.default("BreakStatement", { label: term_1003.label ? term_1003.label.val() : null });
  }
  expandDoWhileStatement(term_1004) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_1004.body), test: this.expand(term_1004.test) });
  }
  expandWithStatement(term_1005) {
    return new _terms2.default("WithStatement", { body: this.expand(term_1005.body), object: this.expand(term_1005.object) });
  }
  expandDebuggerStatement(term_1006) {
    return term_1006;
  }
  expandContinueStatement(term_1007) {
    return new _terms2.default("ContinueStatement", { label: term_1007.label ? term_1007.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_1008) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_1008.discriminant), preDefaultCases: term_1008.preDefaultCases.map(c_1009 => this.expand(c_1009)).toArray(), defaultCase: this.expand(term_1008.defaultCase), postDefaultCases: term_1008.postDefaultCases.map(c_1010 => this.expand(c_1010)).toArray() });
  }
  expandComputedMemberExpression(term_1011) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_1011.object), expression: this.expand(term_1011.expression) });
  }
  expandSwitchStatement(term_1012) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_1012.discriminant), cases: term_1012.cases.map(c_1013 => this.expand(c_1013)).toArray() });
  }
  expandFormalParameters(term_1014) {
    let rest_1015 = term_1014.rest == null ? null : this.expand(term_1014.rest);
    return new _terms2.default("FormalParameters", { items: term_1014.items.map(i_1016 => this.expand(i_1016)), rest: rest_1015 });
  }
  expandArrowExpression(term_1017) {
    return this.doFunctionExpansion(term_1017, "ArrowExpression");
  }
  expandSwitchDefault(term_1018) {
    return new _terms2.default("SwitchDefault", { consequent: term_1018.consequent.map(c_1019 => this.expand(c_1019)).toArray() });
  }
  expandSwitchCase(term_1020) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_1020.test), consequent: term_1020.consequent.map(c_1021 => this.expand(c_1021)).toArray() });
  }
  expandForInStatement(term_1022) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_1022.left), right: this.expand(term_1022.right), body: this.expand(term_1022.body) });
  }
  expandTryCatchStatement(term_1023) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_1023.body), catchClause: this.expand(term_1023.catchClause) });
  }
  expandTryFinallyStatement(term_1024) {
    let catchClause_1025 = term_1024.catchClause == null ? null : this.expand(term_1024.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_1024.body), catchClause: catchClause_1025, finalizer: this.expand(term_1024.finalizer) });
  }
  expandCatchClause(term_1026) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_1026.binding), body: this.expand(term_1026.body) });
  }
  expandThrowStatement(term_1027) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_1027.expression) });
  }
  expandForOfStatement(term_1028) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_1028.left), right: this.expand(term_1028.right), body: this.expand(term_1028.body) });
  }
  expandBindingIdentifier(term_1029) {
    return term_1029;
  }
  expandBindingPropertyIdentifier(term_1030) {
    return term_1030;
  }
  expandBindingPropertyProperty(term_1031) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_1031.name), binding: this.expand(term_1031.binding) });
  }
  expandComputedPropertyName(term_1032) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_1032.expression) });
  }
  expandObjectBinding(term_1033) {
    return new _terms2.default("ObjectBinding", { properties: term_1033.properties.map(t_1034 => this.expand(t_1034)).toArray() });
  }
  expandArrayBinding(term_1035) {
    let restElement_1036 = term_1035.restElement == null ? null : this.expand(term_1035.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_1035.elements.map(t_1037 => t_1037 == null ? null : this.expand(t_1037)).toArray(), restElement: restElement_1036 });
  }
  expandBindingWithDefault(term_1038) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_1038.binding), init: this.expand(term_1038.init) });
  }
  expandShorthandProperty(term_1039) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_1039.name }), expression: new _terms2.default("IdentifierExpression", { name: term_1039.name }) });
  }
  expandForStatement(term_1040) {
    let init_1041 = term_1040.init == null ? null : this.expand(term_1040.init);
    let test_1042 = term_1040.test == null ? null : this.expand(term_1040.test);
    let update_1043 = term_1040.update == null ? null : this.expand(term_1040.update);
    let body_1044 = this.expand(term_1040.body);
    return new _terms2.default("ForStatement", { init: init_1041, test: test_1042, update: update_1043, body: body_1044 });
  }
  expandYieldExpression(term_1045) {
    let expr_1046 = term_1045.expression == null ? null : this.expand(term_1045.expression);
    return new _terms2.default("YieldExpression", { expression: expr_1046 });
  }
  expandYieldGeneratorExpression(term_1047) {
    let expr_1048 = term_1047.expression == null ? null : this.expand(term_1047.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_1048 });
  }
  expandWhileStatement(term_1049) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_1049.test), body: this.expand(term_1049.body) });
  }
  expandIfStatement(term_1050) {
    let consequent_1051 = term_1050.consequent == null ? null : this.expand(term_1050.consequent);
    let alternate_1052 = term_1050.alternate == null ? null : this.expand(term_1050.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_1050.test), consequent: consequent_1051, alternate: alternate_1052 });
  }
  expandBlockStatement(term_1053) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_1053.block) });
  }
  expandBlock(term_1054) {
    let scope_1055 = (0, _scope.freshScope)("block");
    this.context.currentScope.push(scope_1055);
    let compiler_1056 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1057, bodyTerm_1058;
    markedBody_1057 = term_1054.statements.map(b_1059 => b_1059.addScope(scope_1055, this.context.bindings, _syntax.ALL_PHASES));
    bodyTerm_1058 = new _terms2.default("Block", { statements: compiler_1056.compile(markedBody_1057) });
    this.context.currentScope.pop();
    return bodyTerm_1058;
  }
  expandVariableDeclarationStatement(term_1060) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_1060.declaration) });
  }
  expandReturnStatement(term_1061) {
    if (term_1061.expression == null) {
      return term_1061;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_1061.expression) });
  }
  expandClassDeclaration(term_1062) {
    return new _terms2.default("ClassDeclaration", { name: term_1062.name == null ? null : this.expand(term_1062.name), super: term_1062.super == null ? null : this.expand(term_1062.super), elements: term_1062.elements.map(el_1063 => this.expand(el_1063)).toArray() });
  }
  expandClassExpression(term_1064) {
    return new _terms2.default("ClassExpression", { name: term_1064.name == null ? null : this.expand(term_1064.name), super: term_1064.super == null ? null : this.expand(term_1064.super), elements: term_1064.elements.map(el_1065 => this.expand(el_1065)).toArray() });
  }
  expandClassElement(term_1066) {
    return new _terms2.default("ClassElement", { isStatic: term_1066.isStatic, method: this.expand(term_1066.method) });
  }
  expandThisExpression(term_1067) {
    return term_1067;
  }
  expandSyntaxTemplate(term_1068) {
    let r_1069 = (0, _templateProcessor.processTemplate)(term_1068.template.inner());
    let str_1070 = _syntax2.default.from("string", _serializer.serializer.write(r_1069.template));
    let callee_1071 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1072 = r_1069.interp.map(i_1074 => {
      let enf_1075 = new _enforester.Enforester(i_1074, (0, _immutable.List)(), this.context);
      return this.expand(enf_1075.enforest("expression"));
    });
    let args_1073 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1070 })).concat(expandedInterps_1072);
    return new _terms2.default("CallExpression", { callee: callee_1071, arguments: args_1073 });
  }
  expandSyntaxQuote(term_1076) {
    let str_1077 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1076.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1076.template.tag, elements: term_1076.template.elements.push(str_1077).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1078) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1078.object), property: term_1078.property });
  }
  expandArrayExpression(term_1079) {
    return new _terms2.default("ArrayExpression", { elements: term_1079.elements.map(t_1080 => t_1080 == null ? t_1080 : this.expand(t_1080)) });
  }
  expandImport(term_1081) {
    return term_1081;
  }
  expandImportNamespace(term_1082) {
    return term_1082;
  }
  expandExport(term_1083) {
    return new _terms2.default("Export", { declaration: this.expand(term_1083.declaration) });
  }
  expandExportDefault(term_1084) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1084.body) });
  }
  expandExportFrom(term_1085) {
    return term_1085;
  }
  expandExportAllFrom(term_1086) {
    return term_1086;
  }
  expandExportSpecifier(term_1087) {
    return term_1087;
  }
  expandStaticPropertyName(term_1088) {
    return term_1088;
  }
  expandDataProperty(term_1089) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1089.name), expression: this.expand(term_1089.expression) });
  }
  expandObjectExpression(term_1090) {
    return new _terms2.default("ObjectExpression", { properties: term_1090.properties.map(t_1091 => this.expand(t_1091)) });
  }
  expandVariableDeclarator(term_1092) {
    let init_1093 = term_1092.init == null ? null : this.expand(term_1092.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1092.binding), init: init_1093 });
  }
  expandVariableDeclaration(term_1094) {
    if (term_1094.kind === "syntax" || term_1094.kind === "syntaxrec") {
      return term_1094;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1094.kind, declarators: term_1094.declarators.map(d_1095 => this.expand(d_1095)) });
  }
  expandParenthesizedExpression(term_1096) {
    if (term_1096.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1097 = new _enforester.Enforester(term_1096.inner, (0, _immutable.List)(), this.context);
    let lookahead_1098 = enf_1097.peek();
    let t_1099 = enf_1097.enforestExpression();
    if (t_1099 == null || enf_1097.rest.size > 0) {
      throw enf_1097.createError(lookahead_1098, "unexpected syntax");
    }
    return this.expand(t_1099);
  }
  expandUnaryExpression(term_1100) {
    return new _terms2.default("UnaryExpression", { operator: term_1100.operator, operand: this.expand(term_1100.operand) });
  }
  expandUpdateExpression(term_1101) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1101.isPrefix, operator: term_1101.operator, operand: this.expand(term_1101.operand) });
  }
  expandBinaryExpression(term_1102) {
    let left_1103 = this.expand(term_1102.left);
    let right_1104 = this.expand(term_1102.right);
    return new _terms2.default("BinaryExpression", { left: left_1103, operator: term_1102.operator, right: right_1104 });
  }
  expandConditionalExpression(term_1105) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1105.test), consequent: this.expand(term_1105.consequent), alternate: this.expand(term_1105.alternate) });
  }
  expandNewTargetExpression(term_1106) {
    return term_1106;
  }
  expandNewExpression(term_1107) {
    let callee_1108 = this.expand(term_1107.callee);
    let enf_1109 = new _enforester.Enforester(term_1107.arguments, (0, _immutable.List)(), this.context);
    let args_1110 = enf_1109.enforestArgumentList().map(arg_1111 => this.expand(arg_1111));
    return new _terms2.default("NewExpression", { callee: callee_1108, arguments: args_1110.toArray() });
  }
  expandSuper(term_1112) {
    return term_1112;
  }
  expandCallExpression(term_1113) {
    let callee_1114 = this.expand(term_1113.callee);
    let enf_1115 = new _enforester.Enforester(term_1113.arguments, (0, _immutable.List)(), this.context);
    let args_1116 = enf_1115.enforestArgumentList().map(arg_1117 => this.expand(arg_1117));
    return new _terms2.default("CallExpression", { callee: callee_1114, arguments: args_1116 });
  }
  expandSpreadElement(term_1118) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1118.expression) });
  }
  expandExpressionStatement(term_1119) {
    let child_1120 = this.expand(term_1119.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1120 });
  }
  expandLabeledStatement(term_1121) {
    return new _terms2.default("LabeledStatement", { label: term_1121.label.val(), body: this.expand(term_1121.body) });
  }
  doFunctionExpansion(term_1122, type_1123) {
    let scope_1124 = (0, _scope.freshScope)("fun");
    let red_1125 = new _applyScopeInParamsReducer2.default(scope_1124, this.context);
    let params_1126;
    if (type_1123 !== "Getter" && type_1123 !== "Setter") {
      params_1126 = red_1125.transform(term_1122.params);
      params_1126 = this.expand(params_1126);
    }
    this.context.currentScope.push(scope_1124);
    let compiler_1127 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1128, bodyTerm_1129;
    if (term_1122.body instanceof _terms2.default) {
      bodyTerm_1129 = this.expand(term_1122.body.addScope(scope_1124, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1128 = term_1122.body.map(b_1130 => b_1130.addScope(scope_1124, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1129 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1127.compile(markedBody_1128) });
    }
    this.context.currentScope.pop();
    if (type_1123 === "Getter") {
      return new _terms2.default(type_1123, { name: this.expand(term_1122.name), body: bodyTerm_1129 });
    } else if (type_1123 === "Setter") {
      return new _terms2.default(type_1123, { name: this.expand(term_1122.name), param: term_1122.param, body: bodyTerm_1129 });
    }
    return new _terms2.default(type_1123, { name: term_1122.name, isGenerator: term_1122.isGenerator, params: params_1126, body: bodyTerm_1129 });
  }
  expandMethod(term_1131) {
    return this.doFunctionExpansion(term_1131, "Method");
  }
  expandSetter(term_1132) {
    return this.doFunctionExpansion(term_1132, "Setter");
  }
  expandGetter(term_1133) {
    return this.doFunctionExpansion(term_1133, "Getter");
  }
  expandFunctionDeclaration(term_1134) {
    return this.doFunctionExpansion(term_1134, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1135) {
    return this.doFunctionExpansion(term_1135, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1136) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1136.binding), operator: term_1136.operator, expression: this.expand(term_1136.expression) });
  }
  expandAssignmentExpression(term_1137) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1137.binding), expression: this.expand(term_1137.expression) });
  }
  expandEmptyStatement(term_1138) {
    return term_1138;
  }
  expandLiteralBooleanExpression(term_1139) {
    return term_1139;
  }
  expandLiteralNumericExpression(term_1140) {
    return term_1140;
  }
  expandLiteralInfinityExpression(term_1141) {
    return term_1141;
  }
  expandIdentifierExpression(term_1142) {
    let trans_1143 = this.context.env.get(term_1142.name.resolve(this.context.phase));
    if (trans_1143) {
      return new _terms2.default("IdentifierExpression", { name: trans_1143.id });
    }
    return term_1142;
  }
  expandLiteralNullExpression(term_1144) {
    return term_1144;
  }
  expandLiteralStringExpression(term_1145) {
    return term_1145;
  }
  expandLiteralRegExpExpression(term_1146) {
    return term_1146;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFNBQVAsRUFBa0I7QUFDaEIsV0FBTyxLQUFLLFFBQUwsQ0FBYyxTQUFkLENBQVA7QUFDRDtBQUNELGVBQWEsU0FBYixFQUF3QjtBQUN0QixXQUFPLFNBQVA7QUFDRDtBQUNELDJCQUF5QixTQUF6QixFQUFvQztBQUNsQyxXQUFPLG9CQUFTLG9CQUFULEVBQStCLEVBQUMsS0FBSyxVQUFVLEdBQVYsSUFBaUIsSUFBakIsR0FBd0IsSUFBeEIsR0FBK0IsS0FBSyxNQUFMLENBQVksVUFBVSxHQUF0QixDQUFyQyxFQUFpRSxVQUFVLFVBQVUsUUFBVixDQUFtQixPQUFuQixFQUEzRSxFQUEvQixDQUFQO0FBQ0Q7QUFDRCx1QkFBcUIsU0FBckIsRUFBZ0M7QUFDOUIsV0FBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sVUFBVSxLQUFWLEdBQWtCLFVBQVUsS0FBVixDQUFnQixHQUFoQixFQUFsQixHQUEwQyxJQUFsRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsU0FBdkIsRUFBa0M7QUFDaEMsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksVUFBVSxJQUF0QixDQUFQLEVBQW9DLE1BQU0sS0FBSyxNQUFMLENBQVksVUFBVSxJQUF0QixDQUExQyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsU0FBcEIsRUFBK0I7QUFDN0IsV0FBTyxvQkFBUyxlQUFULEVB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RDtBQUNELHVCQUFxQixTQUFyQixFQUFnQztBQUM5QixXQUFPLFNBQVA7QUFDRDtBQUNELGlDQUErQixTQUEvQixFQUEwQztBQUN4QyxXQUFPLFNBQVA7QUFDRDtBQUNELGlDQUErQixTQUEvQixFQUEwQztBQUN4QyxXQUFPLFNBQVA7QUFDRDtBQUNELGtDQUFnQyxTQUFoQyxFQUEyQztBQUN6QyxXQUFPLFNBQVA7QUFDRDtBQUNELDZCQUEyQixTQUEzQixFQUFzQztBQUNwQyxRQUFJLGFBQWEsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixVQUFVLElBQVYsQ0FBZSxPQUFmLENBQXVCLEtBQUssT0FBTCxDQUFhLEtBQXBDLENBQXJCLENBQWpCO0FBQ0EsUUFBSSxVQUFKLEVBQWdCO0FBQ2QsYUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQXBWcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85OTkpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0Xzk5OTtcbiAgfVxuICBleHBhbmQodGVybV8xMDAwKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2godGVybV8xMDAwKTtcbiAgfVxuICBleHBhbmRQcmFnbWEodGVybV8xMDAxKSB7XG4gICAgcmV0dXJuIHRlcm1fMTAwMTtcbiAgfVxuICBleHBhbmRUZW1wbGF0ZUV4cHJlc3Npb24odGVybV8xMDAyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fMTAwMi50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDIudGFnKSwgZWxlbWVudHM6IHRlcm1fMTAwMi5lbGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRCcmVha1N0YXRlbWVudCh0ZXJtXzEwMDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fMTAwMy5sYWJlbCA/IHRlcm1fMTAwMy5sYWJlbC52YWwoKSA6IG51bGx9KTtcbiAgfVxuICBleHBhbmREb1doaWxlU3RhdGVtZW50KHRlcm1fMTAwNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAwNC5ib2R5KSwgdGVzdDogdGhpcy5leHBhbmQodGVybV8xMDA0LnRlc3QpfSk7XG4gIH1cbiAgZXhwYW5kV2l0aFN0YXRlbWVudCh0ZXJtXzEwMDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDUuYm9keSksIG9iamVjdDogdGhpcy5leHBhbmQodGVybV8xMDA1Lm9iamVjdCl9KTtcbiAgfVxuICBleHBhbmREZWJ1Z2dlclN0YXRlbWVudCh0ZXJtXzEwMDYpIHtcbiAgICByZXR1cm4gdGVybV8xMDA2O1xuICB9XG4gIGV4cGFuZENvbnRpbnVlU3RhdGVtZW50KHRlcm1fMTAwNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV8xMDA3LmxhYmVsID8gdGVybV8xMDA3LmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0KHRlcm1fMTAwOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAwOC5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fMTAwOC5wcmVEZWZhdWx0Q2FzZXMubWFwKGNfMTAwOSA9PiB0aGlzLmV4cGFuZChjXzEwMDkpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDguZGVmYXVsdENhc2UpLCBwb3N0RGVmYXVsdENhc2VzOiB0ZXJtXzEwMDgucG9zdERlZmF1bHRDYXNlcy5tYXAoY18xMDEwID0+IHRoaXMuZXhwYW5kKGNfMTAxMCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzEwMTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV8xMDExLm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTAxMS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudCh0ZXJtXzEwMTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV8xMDEyLmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzEwMTIuY2FzZXMubWFwKGNfMTAxMyA9PiB0aGlzLmV4cGFuZChjXzEwMTMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fMTAxNCkge1xuICAgIGxldCByZXN0XzEwMTUgPSB0ZXJtXzEwMTQucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNC5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogdGVybV8xMDE0Lml0ZW1zLm1hcChpXzEwMTYgPT4gdGhpcy5leHBhbmQoaV8xMDE2KSksIHJlc3Q6IHJlc3RfMTAxNX0pO1xuICB9XG4gIGV4cGFuZEFycm93RXhwcmVzc2lvbih0ZXJtXzEwMTcpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTAxNywgXCJBcnJvd0V4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtXzEwMTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0ZXJtXzEwMTguY29uc2VxdWVudC5tYXAoY18xMDE5ID0+IHRoaXMuZXhwYW5kKGNfMTAxOSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaENhc2UodGVybV8xMDIwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMDIwLnRlc3QpLCBjb25zZXF1ZW50OiB0ZXJtXzEwMjAuY29uc2VxdWVudC5tYXAoY18xMDIxID0+IHRoaXMuZXhwYW5kKGNfMTAyMSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEZvckluU3RhdGVtZW50KHRlcm1fMTAyMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvckluU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjIubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjIucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjIuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUcnlDYXRjaFN0YXRlbWVudCh0ZXJtXzEwMjMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV8xMDIzLmJvZHkpLCBjYXRjaENsYXVzZTogdGhpcy5leHBhbmQodGVybV8xMDIzLmNhdGNoQ2xhdXNlKX0pO1xuICB9XG4gIGV4cGFuZFRyeUZpbmFsbHlTdGF0ZW1lbnQodGVybV8xMDI0KSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzEwMjUgPSB0ZXJtXzEwMjQuY2F0Y2hDbGF1c2UgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjQuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAyNC5ib2R5KSwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlXzEwMjUsIGZpbmFsaXplcjogdGhpcy5leHBhbmQodGVybV8xMDI0LmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzEwMjYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDI2LmJpbmRpbmcpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjYuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzEwMjcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDI3LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRm9yT2ZTdGF0ZW1lbnQodGVybV8xMDI4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAyOC5sZWZ0KSwgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAyOC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAyOC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fMTAyOSkge1xuICAgIHJldHVybiB0ZXJtXzEwMjk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtXzEwMzApIHtcbiAgICByZXR1cm4gdGVybV8xMDMwO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5KHRlcm1fMTAzMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzEubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTAzMS5iaW5kaW5nKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkUHJvcGVydHlOYW1lKHRlcm1fMTAzMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzIuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fMTAzMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTAzMy5wcm9wZXJ0aWVzLm1hcCh0XzEwMzQgPT4gdGhpcy5leHBhbmQodF8xMDM0KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm1fMTAzNSkge1xuICAgIGxldCByZXN0RWxlbWVudF8xMDM2ID0gdGVybV8xMDM1LnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDM1LnJlc3RFbGVtZW50KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzEwMzUuZWxlbWVudHMubWFwKHRfMTAzNyA9PiB0XzEwMzcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0XzEwMzcpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMDM2fSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1dpdGhEZWZhdWx0KHRlcm1fMTAzOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDM4LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzguaW5pdCl9KTtcbiAgfVxuICBleHBhbmRTaG9ydGhhbmRQcm9wZXJ0eSh0ZXJtXzEwMzkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGVybV8xMDM5Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV8xMDM5Lm5hbWV9KX0pO1xuICB9XG4gIGV4cGFuZEZvclN0YXRlbWVudCh0ZXJtXzEwNDApIHtcbiAgICBsZXQgaW5pdF8xMDQxID0gdGVybV8xMDQwLmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDAuaW5pdCk7XG4gICAgbGV0IHRlc3RfMTA0MiA9IHRlcm1fMTA0MC50ZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDQwLnRlc3QpO1xuICAgIGxldCB1cGRhdGVfMTA0MyA9IHRlcm1fMTA0MC51cGRhdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDAudXBkYXRlKTtcbiAgICBsZXQgYm9keV8xMDQ0ID0gdGhpcy5leHBhbmQodGVybV8xMDQwLmJvZHkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF8xMDQxLCB0ZXN0OiB0ZXN0XzEwNDIsIHVwZGF0ZTogdXBkYXRlXzEwNDMsIGJvZHk6IGJvZHlfMTA0NH0pO1xuICB9XG4gIGV4cGFuZFlpZWxkRXhwcmVzc2lvbih0ZXJtXzEwNDUpIHtcbiAgICBsZXQgZXhwcl8xMDQ2ID0gdGVybV8xMDQ1LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDUuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzEwNDZ9KTtcbiAgfVxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybV8xMDQ3KSB7XG4gICAgbGV0IGV4cHJfMTA0OCA9IHRlcm1fMTA0Ny5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDQ3LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xMDQ4fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV8xMDQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTA0OS50ZXN0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMDQ5LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV8xMDUwKSB7XG4gICAgbGV0IGNvbnNlcXVlbnRfMTA1MSA9IHRlcm1fMTA1MC5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDUwLmNvbnNlcXVlbnQpO1xuICAgIGxldCBhbHRlcm5hdGVfMTA1MiA9IHRlcm1fMTA1MC5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTAuYWx0ZXJuYXRlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMDUwLnRlc3QpLCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzEwNTEsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzEwNTJ9KTtcbiAgfVxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtXzEwNTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZXhwYW5kKHRlcm1fMTA1My5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzEwNTQpIHtcbiAgICBsZXQgc2NvcGVfMTA1NSA9IGZyZXNoU2NvcGUoXCJibG9ja1wiKTtcbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfMTA1NSk7XG4gICAgbGV0IGNvbXBpbGVyXzEwNTYgPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfMTA1NywgYm9keVRlcm1fMTA1ODtcbiAgICBtYXJrZWRCb2R5XzEwNTcgPSB0ZXJtXzEwNTQuc3RhdGVtZW50cy5tYXAoYl8xMDU5ID0+IGJfMTA1OS5hZGRTY29wZShzY29wZV8xMDU1LCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICBib2R5VGVybV8xMDU4ID0gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogY29tcGlsZXJfMTA1Ni5jb21waWxlKG1hcmtlZEJvZHlfMTA1Nyl9KTtcbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIHJldHVybiBib2R5VGVybV8xMDU4O1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV8xMDYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fMTA2MC5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRSZXR1cm5TdGF0ZW1lbnQodGVybV8xMDYxKSB7XG4gICAgaWYgKHRlcm1fMTA2MS5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXJtXzEwNjE7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDYxLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzEwNjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0RlY2xhcmF0aW9uXCIsIHtuYW1lOiB0ZXJtXzEwNjIubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA2Mi5uYW1lKSwgc3VwZXI6IHRlcm1fMTA2Mi5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA2Mi5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzEwNjIuZWxlbWVudHMubWFwKGVsXzEwNjMgPT4gdGhpcy5leHBhbmQoZWxfMTA2MykpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRXhwcmVzc2lvbih0ZXJtXzEwNjQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fMTA2NC5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDY0Lm5hbWUpLCBzdXBlcjogdGVybV8xMDY0LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDY0LnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fMTA2NC5lbGVtZW50cy5tYXAoZWxfMTA2NSA9PiB0aGlzLmV4cGFuZChlbF8xMDY1KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFbGVtZW50KHRlcm1fMTA2Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRWxlbWVudFwiLCB7aXNTdGF0aWM6IHRlcm1fMTA2Ni5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNjYubWV0aG9kKX0pO1xuICB9XG4gIGV4cGFuZFRoaXNFeHByZXNzaW9uKHRlcm1fMTA2Nykge1xuICAgIHJldHVybiB0ZXJtXzEwNjc7XG4gIH1cbiAgZXhwYW5kU3ludGF4VGVtcGxhdGUodGVybV8xMDY4KSB7XG4gICAgbGV0IHJfMTA2OSA9IHByb2Nlc3NUZW1wbGF0ZSh0ZXJtXzEwNjgudGVtcGxhdGUuaW5uZXIoKSk7XG4gICAgbGV0IHN0cl8xMDcwID0gU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgc2VyaWFsaXplci53cml0ZShyXzEwNjkudGVtcGxhdGUpKTtcbiAgICBsZXQgY2FsbGVlXzEwNzEgPSBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBTeW50YXguZnJvbShcImlkZW50aWZpZXJcIiwgXCJzeW50YXhUZW1wbGF0ZVwiKX0pO1xuICAgIGxldCBleHBhbmRlZEludGVycHNfMTA3MiA9IHJfMTA2OS5pbnRlcnAubWFwKGlfMTA3NCA9PiB7XG4gICAgICBsZXQgZW5mXzEwNzUgPSBuZXcgRW5mb3Jlc3RlcihpXzEwNzQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZChlbmZfMTA3NS5lbmZvcmVzdChcImV4cHJlc3Npb25cIikpO1xuICAgIH0pO1xuICAgIGxldCBhcmdzXzEwNzMgPSBMaXN0Lm9mKG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBzdHJfMTA3MH0pKS5jb25jYXQoZXhwYW5kZWRJbnRlcnBzXzEwNzIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDcxLCBhcmd1bWVudHM6IGFyZ3NfMTA3M30pO1xuICB9XG4gIGV4cGFuZFN5bnRheFF1b3RlKHRlcm1fMTA3Nikge1xuICAgIGxldCBzdHJfMTA3NyA9IG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHRlcm1fMTA3Ni5uYW1lKSl9KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV8xMDc2LnRlbXBsYXRlLnRhZywgZWxlbWVudHM6IHRlcm1fMTA3Ni50ZW1wbGF0ZS5lbGVtZW50cy5wdXNoKHN0cl8xMDc3KS5wdXNoKG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogXCJcIn0pKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdGF0aWNNZW1iZXJFeHByZXNzaW9uKHRlcm1fMTA3OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV8xMDc4Lm9iamVjdCksIHByb3BlcnR5OiB0ZXJtXzEwNzgucHJvcGVydHl9KTtcbiAgfVxuICBleHBhbmRBcnJheUV4cHJlc3Npb24odGVybV8xMDc5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogdGVybV8xMDc5LmVsZW1lbnRzLm1hcCh0XzEwODAgPT4gdF8xMDgwID09IG51bGwgPyB0XzEwODAgOiB0aGlzLmV4cGFuZCh0XzEwODApKX0pO1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzEwODEpIHtcbiAgICByZXR1cm4gdGVybV8xMDgxO1xuICB9XG4gIGV4cGFuZEltcG9ydE5hbWVzcGFjZSh0ZXJtXzEwODIpIHtcbiAgICByZXR1cm4gdGVybV8xMDgyO1xuICB9XG4gIGV4cGFuZEV4cG9ydCh0ZXJtXzEwODMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwODMuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RGVmYXVsdCh0ZXJtXzEwODQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwODQuYm9keSl9KTtcbiAgfVxuICBleHBhbmRFeHBvcnRGcm9tKHRlcm1fMTA4NSkge1xuICAgIHJldHVybiB0ZXJtXzEwODU7XG4gIH1cbiAgZXhwYW5kRXhwb3J0QWxsRnJvbSh0ZXJtXzEwODYpIHtcbiAgICByZXR1cm4gdGVybV8xMDg2O1xuICB9XG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtXzEwODcpIHtcbiAgICByZXR1cm4gdGVybV8xMDg3O1xuICB9XG4gIGV4cGFuZFN0YXRpY1Byb3BlcnR5TmFtZSh0ZXJtXzEwODgpIHtcbiAgICByZXR1cm4gdGVybV8xMDg4O1xuICB9XG4gIGV4cGFuZERhdGFQcm9wZXJ0eSh0ZXJtXzEwODkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTA4OS5uYW1lKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDg5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0RXhwcmVzc2lvbih0ZXJtXzEwOTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzEwOTAucHJvcGVydGllcy5tYXAodF8xMDkxID0+IHRoaXMuZXhwYW5kKHRfMTA5MSkpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdG9yKHRlcm1fMTA5Mikge1xuICAgIGxldCBpbml0XzEwOTMgPSB0ZXJtXzEwOTIuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA5Mi5pbml0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTA5Mi5iaW5kaW5nKSwgaW5pdDogaW5pdF8xMDkzfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtXzEwOTQpIHtcbiAgICBpZiAodGVybV8xMDk0LmtpbmQgPT09IFwic3ludGF4XCIgfHwgdGVybV8xMDk0LmtpbmQgPT09IFwic3ludGF4cmVjXCIpIHtcbiAgICAgIHJldHVybiB0ZXJtXzEwOTQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHRlcm1fMTA5NC5raW5kLCBkZWNsYXJhdG9yczogdGVybV8xMDk0LmRlY2xhcmF0b3JzLm1hcChkXzEwOTUgPT4gdGhpcy5leHBhbmQoZF8xMDk1KSl9KTtcbiAgfVxuICBleHBhbmRQYXJlbnRoZXNpemVkRXhwcmVzc2lvbih0ZXJtXzEwOTYpIHtcbiAgICBpZiAodGVybV8xMDk2LmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzEwOTcgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzEwOTYuaW5uZXIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzEwOTggPSBlbmZfMTA5Ny5wZWVrKCk7XG4gICAgbGV0IHRfMTA5OSA9IGVuZl8xMDk3LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzEwOTkgPT0gbnVsbCB8fCBlbmZfMTA5Ny5yZXN0LnNpemUgPiAwKSB7XG4gICAgICB0aHJvdyBlbmZfMTA5Ny5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTA5OCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kKHRfMTA5OSk7XG4gIH1cbiAgZXhwYW5kVW5hcnlFeHByZXNzaW9uKHRlcm1fMTEwMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fMTEwMC5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV8xMTAwLm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kVXBkYXRlRXhwcmVzc2lvbih0ZXJtXzExMDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV8xMTAxLmlzUHJlZml4LCBvcGVyYXRvcjogdGVybV8xMTAxLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzExMDEub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fMTEwMikge1xuICAgIGxldCBsZWZ0XzExMDMgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMDIubGVmdCk7XG4gICAgbGV0IHJpZ2h0XzExMDQgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMDIucmlnaHQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTEwMywgb3BlcmF0b3I6IHRlcm1fMTEwMi5vcGVyYXRvciwgcmlnaHQ6IHJpZ2h0XzExMDR9KTtcbiAgfVxuICBleHBhbmRDb25kaXRpb25hbEV4cHJlc3Npb24odGVybV8xMTA1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzExMDUudGVzdCksIGNvbnNlcXVlbnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTEwNS5jb25zZXF1ZW50KSwgYWx0ZXJuYXRlOiB0aGlzLmV4cGFuZCh0ZXJtXzExMDUuYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV8xMTA2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTEwNjtcbiAgfVxuICBleHBhbmROZXdFeHByZXNzaW9uKHRlcm1fMTEwNykge1xuICAgIGxldCBjYWxsZWVfMTEwOCA9IHRoaXMuZXhwYW5kKHRlcm1fMTEwNy5jYWxsZWUpO1xuICAgIGxldCBlbmZfMTEwOSA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTEwNy5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc18xMTEwID0gZW5mXzExMDkuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzExMTEgPT4gdGhpcy5leHBhbmQoYXJnXzExMTEpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMTA4LCBhcmd1bWVudHM6IGFyZ3NfMTExMC50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdXBlcih0ZXJtXzExMTIpIHtcbiAgICByZXR1cm4gdGVybV8xMTEyO1xuICB9XG4gIGV4cGFuZENhbGxFeHByZXNzaW9uKHRlcm1fMTExMykge1xuICAgIGxldCBjYWxsZWVfMTExNCA9IHRoaXMuZXhwYW5kKHRlcm1fMTExMy5jYWxsZWUpO1xuICAgIGxldCBlbmZfMTExNSA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTExMy5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc18xMTE2ID0gZW5mXzExMTUuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzExMTcgPT4gdGhpcy5leHBhbmQoYXJnXzExMTcpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTExNCwgYXJndW1lbnRzOiBhcmdzXzExMTZ9KTtcbiAgfVxuICBleHBhbmRTcHJlYWRFbGVtZW50KHRlcm1fMTExOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTExOC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cHJlc3Npb25TdGF0ZW1lbnQodGVybV8xMTE5KSB7XG4gICAgbGV0IGNoaWxkXzExMjAgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMTkuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogY2hpbGRfMTEyMH0pO1xuICB9XG4gIGV4cGFuZExhYmVsZWRTdGF0ZW1lbnQodGVybV8xMTIxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fMTEyMS5sYWJlbC52YWwoKSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMTIxLmJvZHkpfSk7XG4gIH1cbiAgZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzExMjIsIHR5cGVfMTEyMykge1xuICAgIGxldCBzY29wZV8xMTI0ID0gZnJlc2hTY29wZShcImZ1blwiKTtcbiAgICBsZXQgcmVkXzExMjUgPSBuZXcgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlcihzY29wZV8xMTI0LCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwYXJhbXNfMTEyNjtcbiAgICBpZiAodHlwZV8xMTIzICE9PSBcIkdldHRlclwiICYmIHR5cGVfMTEyMyAhPT0gXCJTZXR0ZXJcIikge1xuICAgICAgcGFyYW1zXzExMjYgPSByZWRfMTEyNS50cmFuc2Zvcm0odGVybV8xMTIyLnBhcmFtcyk7XG4gICAgICBwYXJhbXNfMTEyNiA9IHRoaXMuZXhwYW5kKHBhcmFtc18xMTI2KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzExMjQpO1xuICAgIGxldCBjb21waWxlcl8xMTI3ID0gbmV3IENvbXBpbGVyKHRoaXMuY29udGV4dC5waGFzZSwgdGhpcy5jb250ZXh0LmVudiwgdGhpcy5jb250ZXh0LnN0b3JlLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5XzExMjgsIGJvZHlUZXJtXzExMjk7XG4gICAgaWYgKHRlcm1fMTEyMi5ib2R5IGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgYm9keVRlcm1fMTEyOSA9IHRoaXMuZXhwYW5kKHRlcm1fMTEyMi5ib2R5LmFkZFNjb3BlKHNjb3BlXzExMjQsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5XzExMjggPSB0ZXJtXzExMjIuYm9keS5tYXAoYl8xMTMwID0+IGJfMTEzMC5hZGRTY29wZShzY29wZV8xMTI0LCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICAgIGJvZHlUZXJtXzExMjkgPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBjb21waWxlcl8xMTI3LmNvbXBpbGUobWFya2VkQm9keV8xMTI4KX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzExMjMgPT09IFwiR2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzExMjMsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzExMjIubmFtZSksIGJvZHk6IGJvZHlUZXJtXzExMjl9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVfMTEyMyA9PT0gXCJTZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTEyMywge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTEyMi5uYW1lKSwgcGFyYW06IHRlcm1fMTEyMi5wYXJhbSwgYm9keTogYm9keVRlcm1fMTEyOX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMTIzLCB7bmFtZTogdGVybV8xMTIyLm5hbWUsIGlzR2VuZXJhdG9yOiB0ZXJtXzExMjIuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzExMjYsIGJvZHk6IGJvZHlUZXJtXzExMjl9KTtcbiAgfVxuICBleHBhbmRNZXRob2QodGVybV8xMTMxKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzExMzEsIFwiTWV0aG9kXCIpO1xuICB9XG4gIGV4cGFuZFNldHRlcih0ZXJtXzExMzIpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTEzMiwgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fMTEzMykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTMzLCBcIkdldHRlclwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkRlY2xhcmF0aW9uKHRlcm1fMTEzNCkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTM0LCBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25FeHByZXNzaW9uKHRlcm1fMTEzNSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTM1LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fMTEzNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTEzNi5iaW5kaW5nKSwgb3BlcmF0b3I6IHRlcm1fMTEzNi5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMTM2LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV8xMTM3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTEzNy5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMTM3LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRW1wdHlTdGF0ZW1lbnQodGVybV8xMTM4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTEzODtcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV8xMTM5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTEzOTtcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24odGVybV8xMTQwKSB7XG4gICAgcmV0dXJuIHRlcm1fMTE0MDtcbiAgfVxuICBleHBhbmRMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uKHRlcm1fMTE0MSkge1xuICAgIHJldHVybiB0ZXJtXzExNDE7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV8xMTQyKSB7XG4gICAgbGV0IHRyYW5zXzExNDMgPSB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzExNDIubmFtZS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICAgIGlmICh0cmFuc18xMTQzKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdHJhbnNfMTE0My5pZH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVybV8xMTQyO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzExNDQpIHtcbiAgICByZXR1cm4gdGVybV8xMTQ0O1xuICB9XG4gIGV4cGFuZExpdGVyYWxTdHJpbmdFeHByZXNzaW9uKHRlcm1fMTE0NSkge1xuICAgIHJldHVybiB0ZXJtXzExNDU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24odGVybV8xMTQ2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTE0NjtcbiAgfVxufVxuIl19