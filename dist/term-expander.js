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
  constructor(context_995) {
    super("expand", true);
    this.context = context_995;
  }
  expand(term_996) {
    return this.dispatch(term_996);
  }
  expandPragma(term_997) {
    return term_997;
  }
  expandTemplateExpression(term_998) {
    return new _terms2.default("TemplateExpression", { tag: term_998.tag == null ? null : this.expand(term_998.tag), elements: term_998.elements.toArray() });
  }
  expandBreakStatement(term_999) {
    return new _terms2.default("BreakStatement", { label: term_999.label ? term_999.label.val() : null });
  }
  expandDoWhileStatement(term_1000) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_1000.body), test: this.expand(term_1000.test) });
  }
  expandWithStatement(term_1001) {
    return new _terms2.default("WithStatement", { body: this.expand(term_1001.body), object: this.expand(term_1001.object) });
  }
  expandDebuggerStatement(term_1002) {
    return term_1002;
  }
  expandContinueStatement(term_1003) {
    return new _terms2.default("ContinueStatement", { label: term_1003.label ? term_1003.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_1004) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_1004.discriminant), preDefaultCases: term_1004.preDefaultCases.map(c_1005 => this.expand(c_1005)).toArray(), defaultCase: this.expand(term_1004.defaultCase), postDefaultCases: term_1004.postDefaultCases.map(c_1006 => this.expand(c_1006)).toArray() });
  }
  expandComputedMemberExpression(term_1007) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_1007.object), expression: this.expand(term_1007.expression) });
  }
  expandSwitchStatement(term_1008) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_1008.discriminant), cases: term_1008.cases.map(c_1009 => this.expand(c_1009)).toArray() });
  }
  expandFormalParameters(term_1010) {
    let rest_1011 = term_1010.rest == null ? null : this.expand(term_1010.rest);
    return new _terms2.default("FormalParameters", { items: term_1010.items.map(i_1012 => this.expand(i_1012)), rest: rest_1011 });
  }
  expandArrowExpression(term_1013) {
    return this.doFunctionExpansion(term_1013, "ArrowExpression");
  }
  expandSwitchDefault(term_1014) {
    return new _terms2.default("SwitchDefault", { consequent: term_1014.consequent.map(c_1015 => this.expand(c_1015)).toArray() });
  }
  expandSwitchCase(term_1016) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_1016.test), consequent: term_1016.consequent.map(c_1017 => this.expand(c_1017)).toArray() });
  }
  expandForInStatement(term_1018) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_1018.left), right: this.expand(term_1018.right), body: this.expand(term_1018.body) });
  }
  expandTryCatchStatement(term_1019) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_1019.body), catchClause: this.expand(term_1019.catchClause) });
  }
  expandTryFinallyStatement(term_1020) {
    let catchClause_1021 = term_1020.catchClause == null ? null : this.expand(term_1020.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_1020.body), catchClause: catchClause_1021, finalizer: this.expand(term_1020.finalizer) });
  }
  expandCatchClause(term_1022) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_1022.binding), body: this.expand(term_1022.body) });
  }
  expandThrowStatement(term_1023) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_1023.expression) });
  }
  expandForOfStatement(term_1024) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_1024.left), right: this.expand(term_1024.right), body: this.expand(term_1024.body) });
  }
  expandBindingIdentifier(term_1025) {
    return term_1025;
  }
  expandBindingPropertyIdentifier(term_1026) {
    return term_1026;
  }
  expandBindingPropertyProperty(term_1027) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_1027.name), binding: this.expand(term_1027.binding) });
  }
  expandComputedPropertyName(term_1028) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_1028.expression) });
  }
  expandObjectBinding(term_1029) {
    return new _terms2.default("ObjectBinding", { properties: term_1029.properties.map(t_1030 => this.expand(t_1030)).toArray() });
  }
  expandArrayBinding(term_1031) {
    let restElement_1032 = term_1031.restElement == null ? null : this.expand(term_1031.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_1031.elements.map(t_1033 => t_1033 == null ? null : this.expand(t_1033)).toArray(), restElement: restElement_1032 });
  }
  expandBindingWithDefault(term_1034) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_1034.binding), init: this.expand(term_1034.init) });
  }
  expandShorthandProperty(term_1035) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_1035.name }), expression: new _terms2.default("IdentifierExpression", { name: term_1035.name }) });
  }
  expandForStatement(term_1036) {
    let init_1037 = term_1036.init == null ? null : this.expand(term_1036.init);
    let test_1038 = term_1036.test == null ? null : this.expand(term_1036.test);
    let update_1039 = term_1036.update == null ? null : this.expand(term_1036.update);
    let body_1040 = this.expand(term_1036.body);
    return new _terms2.default("ForStatement", { init: init_1037, test: test_1038, update: update_1039, body: body_1040 });
  }
  expandYieldExpression(term_1041) {
    let expr_1042 = term_1041.expression == null ? null : this.expand(term_1041.expression);
    return new _terms2.default("YieldExpression", { expression: expr_1042 });
  }
  expandYieldGeneratorExpression(term_1043) {
    let expr_1044 = term_1043.expression == null ? null : this.expand(term_1043.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_1044 });
  }
  expandWhileStatement(term_1045) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_1045.test), body: this.expand(term_1045.body) });
  }
  expandIfStatement(term_1046) {
    let consequent_1047 = term_1046.consequent == null ? null : this.expand(term_1046.consequent);
    let alternate_1048 = term_1046.alternate == null ? null : this.expand(term_1046.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_1046.test), consequent: consequent_1047, alternate: alternate_1048 });
  }
  expandBlockStatement(term_1049) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_1049.block) });
  }
  expandBlock(term_1050) {
    let scope_1051 = (0, _scope.freshScope)("block");
    this.context.currentScope.push(scope_1051);
    let compiler_1052 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1053, bodyTerm_1054;
    markedBody_1053 = term_1050.statements.map(b_1055 => b_1055.addScope(scope_1051, this.context.bindings, _syntax.ALL_PHASES));
    bodyTerm_1054 = new _terms2.default("Block", { statements: compiler_1052.compile(markedBody_1053) });
    this.context.currentScope.pop();
    return bodyTerm_1054;
  }
  expandVariableDeclarationStatement(term_1056) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_1056.declaration) });
  }
  expandReturnStatement(term_1057) {
    if (term_1057.expression == null) {
      return term_1057;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_1057.expression) });
  }
  expandClassDeclaration(term_1058) {
    return new _terms2.default("ClassDeclaration", { name: term_1058.name == null ? null : this.expand(term_1058.name), super: term_1058.super == null ? null : this.expand(term_1058.super), elements: term_1058.elements.map(el_1059 => this.expand(el_1059)).toArray() });
  }
  expandClassExpression(term_1060) {
    return new _terms2.default("ClassExpression", { name: term_1060.name == null ? null : this.expand(term_1060.name), super: term_1060.super == null ? null : this.expand(term_1060.super), elements: term_1060.elements.map(el_1061 => this.expand(el_1061)).toArray() });
  }
  expandClassElement(term_1062) {
    return new _terms2.default("ClassElement", { isStatic: term_1062.isStatic, method: this.expand(term_1062.method) });
  }
  expandThisExpression(term_1063) {
    return term_1063;
  }
  expandSyntaxTemplate(term_1064) {
    let r_1065 = (0, _templateProcessor.processTemplate)(term_1064.template.inner());
    let str_1066 = _syntax2.default.from("string", _serializer.serializer.write(r_1065.template));
    let callee_1067 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1068 = r_1065.interp.map(i_1070 => {
      let enf_1071 = new _enforester.Enforester(i_1070, (0, _immutable.List)(), this.context);
      return this.expand(enf_1071.enforest("expression"));
    });
    let args_1069 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1066 })).concat(expandedInterps_1068);
    return new _terms2.default("CallExpression", { callee: callee_1067, arguments: args_1069 });
  }
  expandSyntaxQuote(term_1072) {
    let str_1073 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1072.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1072.template.tag, elements: term_1072.template.elements.push(str_1073).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1074) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1074.object), property: term_1074.property });
  }
  expandArrayExpression(term_1075) {
    return new _terms2.default("ArrayExpression", { elements: term_1075.elements.map(t_1076 => t_1076 == null ? t_1076 : this.expand(t_1076)) });
  }
  expandImport(term_1077) {
    return term_1077;
  }
  expandImportNamespace(term_1078) {
    return term_1078;
  }
  expandExport(term_1079) {
    return new _terms2.default("Export", { declaration: this.expand(term_1079.declaration) });
  }
  expandExportDefault(term_1080) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1080.body) });
  }
  expandExportFrom(term_1081) {
    return term_1081;
  }
  expandExportAllFrom(term_1082) {
    return term_1082;
  }
  expandExportSpecifier(term_1083) {
    return term_1083;
  }
  expandStaticPropertyName(term_1084) {
    return term_1084;
  }
  expandDataProperty(term_1085) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1085.name), expression: this.expand(term_1085.expression) });
  }
  expandObjectExpression(term_1086) {
    return new _terms2.default("ObjectExpression", { properties: term_1086.properties.map(t_1087 => this.expand(t_1087)) });
  }
  expandVariableDeclarator(term_1088) {
    let init_1089 = term_1088.init == null ? null : this.expand(term_1088.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1088.binding), init: init_1089 });
  }
  expandVariableDeclaration(term_1090) {
    if (term_1090.kind === "syntax" || term_1090.kind === "syntaxrec") {
      return term_1090;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1090.kind, declarators: term_1090.declarators.map(d_1091 => this.expand(d_1091)) });
  }
  expandParenthesizedExpression(term_1092) {
    if (term_1092.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1093 = new _enforester.Enforester(term_1092.inner, (0, _immutable.List)(), this.context);
    let lookahead_1094 = enf_1093.peek();
    let t_1095 = enf_1093.enforestExpression();
    if (t_1095 == null || enf_1093.rest.size > 0) {
      throw enf_1093.createError(lookahead_1094, "unexpected syntax");
    }
    return this.expand(t_1095);
  }
  expandUnaryExpression(term_1096) {
    return new _terms2.default("UnaryExpression", { operator: term_1096.operator, operand: this.expand(term_1096.operand) });
  }
  expandUpdateExpression(term_1097) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1097.isPrefix, operator: term_1097.operator, operand: this.expand(term_1097.operand) });
  }
  expandBinaryExpression(term_1098) {
    let left_1099 = this.expand(term_1098.left);
    let right_1100 = this.expand(term_1098.right);
    return new _terms2.default("BinaryExpression", { left: left_1099, operator: term_1098.operator, right: right_1100 });
  }
  expandConditionalExpression(term_1101) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1101.test), consequent: this.expand(term_1101.consequent), alternate: this.expand(term_1101.alternate) });
  }
  expandNewTargetExpression(term_1102) {
    return term_1102;
  }
  expandNewExpression(term_1103) {
    let callee_1104 = this.expand(term_1103.callee);
    let enf_1105 = new _enforester.Enforester(term_1103.arguments, (0, _immutable.List)(), this.context);
    let args_1106 = enf_1105.enforestArgumentList().map(arg_1107 => this.expand(arg_1107));
    return new _terms2.default("NewExpression", { callee: callee_1104, arguments: args_1106.toArray() });
  }
  expandSuper(term_1108) {
    return term_1108;
  }
  expandCallExpression(term_1109) {
    let callee_1110 = this.expand(term_1109.callee);
    let enf_1111 = new _enforester.Enforester(term_1109.arguments, (0, _immutable.List)(), this.context);
    let args_1112 = enf_1111.enforestArgumentList().map(arg_1113 => this.expand(arg_1113));
    return new _terms2.default("CallExpression", { callee: callee_1110, arguments: args_1112 });
  }
  expandSpreadElement(term_1114) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1114.expression) });
  }
  expandExpressionStatement(term_1115) {
    let child_1116 = this.expand(term_1115.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1116 });
  }
  expandLabeledStatement(term_1117) {
    return new _terms2.default("LabeledStatement", { label: term_1117.label.val(), body: this.expand(term_1117.body) });
  }
  doFunctionExpansion(term_1118, type_1119) {
    let scope_1120 = (0, _scope.freshScope)("fun");
    let red_1121 = new _applyScopeInParamsReducer2.default(scope_1120, this.context);
    let params_1122;
    if (type_1119 !== "Getter" && type_1119 !== "Setter") {
      params_1122 = red_1121.transform(term_1118.params);
      params_1122 = this.expand(params_1122);
    }
    this.context.currentScope.push(scope_1120);
    let compiler_1123 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1124, bodyTerm_1125;
    if (term_1118.body instanceof _terms2.default) {
      bodyTerm_1125 = this.expand(term_1118.body.addScope(scope_1120, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1124 = term_1118.body.map(b_1126 => b_1126.addScope(scope_1120, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1125 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1123.compile(markedBody_1124) });
    }
    this.context.currentScope.pop();
    if (type_1119 === "Getter") {
      return new _terms2.default(type_1119, { name: this.expand(term_1118.name), body: bodyTerm_1125 });
    } else if (type_1119 === "Setter") {
      return new _terms2.default(type_1119, { name: this.expand(term_1118.name), param: term_1118.param, body: bodyTerm_1125 });
    }
    return new _terms2.default(type_1119, { name: term_1118.name, isGenerator: term_1118.isGenerator, params: params_1122, body: bodyTerm_1125 });
  }
  expandMethod(term_1127) {
    return this.doFunctionExpansion(term_1127, "Method");
  }
  expandSetter(term_1128) {
    return this.doFunctionExpansion(term_1128, "Setter");
  }
  expandGetter(term_1129) {
    return this.doFunctionExpansion(term_1129, "Getter");
  }
  expandFunctionDeclaration(term_1130) {
    return this.doFunctionExpansion(term_1130, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1131) {
    return this.doFunctionExpansion(term_1131, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1132) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1132.binding), operator: term_1132.operator, expression: this.expand(term_1132.expression) });
  }
  expandAssignmentExpression(term_1133) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1133.binding), expression: this.expand(term_1133.expression) });
  }
  expandEmptyStatement(term_1134) {
    return term_1134;
  }
  expandLiteralBooleanExpression(term_1135) {
    return term_1135;
  }
  expandLiteralNumericExpression(term_1136) {
    return term_1136;
  }
  expandLiteralInfinityExpression(term_1137) {
    return term_1137;
  }
  expandIdentifierExpression(term_1138) {
    let trans_1139 = this.context.env.get(term_1138.name.resolve(this.context.phase));
    if (trans_1139) {
      return new _terms2.default("IdentifierExpression", { name: trans_1139.id });
    }
    return term_1138;
  }
  expandLiteralNullExpression(term_1140) {
    return term_1140;
  }
  expandLiteralStringExpression(term_1141) {
    return term_1141;
  }
  expandLiteralRegExpExpression(term_1142) {
    return term_1142;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsU0FBdkIsRUFBa0M7QUFDaEMsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksVUFBVSxJQUF0QixDQUFQLEVBQW9DLE1BQU0sS0FBSyxNQUFMLENBQVksVUFBVSxJQUF0QixDQUExQyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsU0FBcEIsRUFBK0I7QUFDN0IsV0FBTyxvQkFBUyxlQUFULEVBQTBC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QUNELHVCQUFxQixTQUFyQixFQUFnQztBQUM5QixXQUFPLFNBQVA7QUFDRDtBQUNELGlDQUErQixTQUEvQixFQUEwQztBQUN4QyxXQUFPLFNBQVA7QUFDRDtBQUNELGlDQUErQixTQUEvQixFQUEwQztBQUN4QyxXQUFPLFNBQVA7QUFDRDtBQUNELGtDQUFnQyxTQUFoQyxFQUEyQztBQUN6QyxXQUFPLFNBQVA7QUFDRDtBQUNELDZCQUEyQixTQUEzQixFQUFzQztBQUNwQyxRQUFJLGFBQWEsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixVQUFVLElBQVYsQ0FBZSxPQUFmLENBQXVCLEtBQUssT0FBTCxDQUFhLEtBQXBDLENBQXJCLENBQWpCO0FBQ0EsUUFBSSxVQUFKLEVBQWdCO0FBQ2QsYUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQXBWcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85OTUpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0Xzk5NTtcbiAgfVxuICBleHBhbmQodGVybV85OTYpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaCh0ZXJtXzk5Nik7XG4gIH1cbiAgZXhwYW5kUHJhZ21hKHRlcm1fOTk3KSB7XG4gICAgcmV0dXJuIHRlcm1fOTk3O1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzk5OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzk5OC50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5OC50YWcpLCBlbGVtZW50czogdGVybV85OTguZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV85OTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTk5LmxhYmVsID8gdGVybV85OTkubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzEwMDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDAuYm9keSksIHRlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAwMC50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV8xMDAxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV8xMDAxLmJvZHkpLCBvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAwMS5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV8xMDAyKSB7XG4gICAgcmV0dXJuIHRlcm1fMTAwMjtcbiAgfVxuICBleHBhbmRDb250aW51ZVN0YXRlbWVudCh0ZXJtXzEwMDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fMTAwMy5sYWJlbCA/IHRlcm1fMTAwMy5sYWJlbC52YWwoKSA6IG51bGx9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCh0ZXJtXzEwMDQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDQuZGlzY3JpbWluYW50KSwgcHJlRGVmYXVsdENhc2VzOiB0ZXJtXzEwMDQucHJlRGVmYXVsdENhc2VzLm1hcChjXzEwMDUgPT4gdGhpcy5leHBhbmQoY18xMDA1KSkudG9BcnJheSgpLCBkZWZhdWx0Q2FzZTogdGhpcy5leHBhbmQodGVybV8xMDA0LmRlZmF1bHRDYXNlKSwgcG9zdERlZmF1bHRDYXNlczogdGVybV8xMDA0LnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfMTAwNiA9PiB0aGlzLmV4cGFuZChjXzEwMDYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDb21wdXRlZE1lbWJlckV4cHJlc3Npb24odGVybV8xMDA3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAwNy5vYmplY3QpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnQodGVybV8xMDA4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAwOC5kaXNjcmltaW5hbnQpLCBjYXNlczogdGVybV8xMDA4LmNhc2VzLm1hcChjXzEwMDkgPT4gdGhpcy5leHBhbmQoY18xMDA5KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ybWFsUGFyYW1ldGVycyh0ZXJtXzEwMTApIHtcbiAgICBsZXQgcmVzdF8xMDExID0gdGVybV8xMDEwLnJlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTAucmVzdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHRlcm1fMTAxMC5pdGVtcy5tYXAoaV8xMDEyID0+IHRoaXMuZXhwYW5kKGlfMTAxMikpLCByZXN0OiByZXN0XzEwMTF9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV8xMDEzKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwMTMsIFwiQXJyb3dFeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZFN3aXRjaERlZmF1bHQodGVybV8xMDE0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV8xMDE0LmNvbnNlcXVlbnQubWFwKGNfMTAxNSA9PiB0aGlzLmV4cGFuZChjXzEwMTUpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fMTAxNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNi50ZXN0KSwgY29uc2VxdWVudDogdGVybV8xMDE2LmNvbnNlcXVlbnQubWFwKGNfMTAxNyA9PiB0aGlzLmV4cGFuZChjXzEwMTcpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JJblN0YXRlbWVudCh0ZXJtXzEwMTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV8xMDE4LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV8xMDE4LnJpZ2h0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMDE4LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV8xMDE5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5Q2F0Y2hTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAxOS5ib2R5KSwgY2F0Y2hDbGF1c2U6IHRoaXMuZXhwYW5kKHRlcm1fMTAxOS5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fMTAyMCkge1xuICAgIGxldCBjYXRjaENsYXVzZV8xMDIxID0gdGVybV8xMDIwLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDIwLmNhdGNoQ2xhdXNlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjAuYm9keSksIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZV8xMDIxLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fMTAyMC5maW5hbGl6ZXIpfSk7XG4gIH1cbiAgZXhwYW5kQ2F0Y2hDbGF1c2UodGVybV8xMDIyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2F0Y2hDbGF1c2VcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTAyMi5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMDIyLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVGhyb3dTdGF0ZW1lbnQodGVybV8xMDIzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTAyMy5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fMTAyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvck9mU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjQubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjQucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjQuYm9keSl9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nSWRlbnRpZmllcih0ZXJtXzEwMjUpIHtcbiAgICByZXR1cm4gdGVybV8xMDI1O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV8xMDI2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTAyNjtcbiAgfVxuICBleHBhbmRCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSh0ZXJtXzEwMjcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDI3Lm5hbWUpLCBiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjcuYmluZGluZyl9KTtcbiAgfVxuICBleHBhbmRDb21wdXRlZFByb3BlcnR5TmFtZSh0ZXJtXzEwMjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDI4LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0QmluZGluZyh0ZXJtXzEwMjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzEwMjkucHJvcGVydGllcy5tYXAodF8xMDMwID0+IHRoaXMuZXhwYW5kKHRfMTAzMCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEFycmF5QmluZGluZyh0ZXJtXzEwMzEpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfMTAzMiA9IHRlcm1fMTAzMS5yZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAzMS5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xMDMxLmVsZW1lbnRzLm1hcCh0XzEwMzMgPT4gdF8xMDMzID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF8xMDMzKSkudG9BcnJheSgpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfMTAzMn0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdXaXRoRGVmYXVsdCh0ZXJtXzEwMzQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNC5iaW5kaW5nKSwgaW5pdDogdGhpcy5leHBhbmQodGVybV8xMDM0LmluaXQpfSk7XG4gIH1cbiAgZXhwYW5kU2hvcnRoYW5kUHJvcGVydHkodGVybV8xMDM1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fMTAzNS5uYW1lfSksIGV4cHJlc3Npb246IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fMTAzNS5uYW1lfSl9KTtcbiAgfVxuICBleHBhbmRGb3JTdGF0ZW1lbnQodGVybV8xMDM2KSB7XG4gICAgbGV0IGluaXRfMTAzNyA9IHRlcm1fMTAzNi5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDM2LmluaXQpO1xuICAgIGxldCB0ZXN0XzEwMzggPSB0ZXJtXzEwMzYudGVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNi50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzEwMzkgPSB0ZXJtXzEwMzYudXBkYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDM2LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfMTA0MCA9IHRoaXMuZXhwYW5kKHRlcm1fMTAzNi5ib2R5KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IGluaXRfMTAzNywgdGVzdDogdGVzdF8xMDM4LCB1cGRhdGU6IHVwZGF0ZV8xMDM5LCBib2R5OiBib2R5XzEwNDB9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV8xMDQxKSB7XG4gICAgbGV0IGV4cHJfMTA0MiA9IHRlcm1fMTA0MS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDQxLmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xMDQyfSk7XG4gIH1cbiAgZXhwYW5kWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uKHRlcm1fMTA0Mykge1xuICAgIGxldCBleHByXzEwNDQgPSB0ZXJtXzEwNDMuZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA0My5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfMTA0NH0pO1xuICB9XG4gIGV4cGFuZFdoaWxlU3RhdGVtZW50KHRlcm1fMTA0NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIldoaWxlU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDUudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTA0NS5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZElmU3RhdGVtZW50KHRlcm1fMTA0Nikge1xuICAgIGxldCBjb25zZXF1ZW50XzEwNDcgPSB0ZXJtXzEwNDYuY29uc2VxdWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Ni5jb25zZXF1ZW50KTtcbiAgICBsZXQgYWx0ZXJuYXRlXzEwNDggPSB0ZXJtXzEwNDYuYWx0ZXJuYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDQ2LmFsdGVybmF0ZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWZTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Ni50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF8xMDQ3LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8xMDQ4fSk7XG4gIH1cbiAgZXhwYW5kQmxvY2tTdGF0ZW1lbnQodGVybV8xMDQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDkuYmxvY2spfSk7XG4gIH1cbiAgZXhwYW5kQmxvY2sodGVybV8xMDUwKSB7XG4gICAgbGV0IHNjb3BlXzEwNTEgPSBmcmVzaFNjb3BlKFwiYmxvY2tcIik7XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzEwNTEpO1xuICAgIGxldCBjb21waWxlcl8xMDUyID0gbmV3IENvbXBpbGVyKHRoaXMuY29udGV4dC5waGFzZSwgdGhpcy5jb250ZXh0LmVudiwgdGhpcy5jb250ZXh0LnN0b3JlLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5XzEwNTMsIGJvZHlUZXJtXzEwNTQ7XG4gICAgbWFya2VkQm9keV8xMDUzID0gdGVybV8xMDUwLnN0YXRlbWVudHMubWFwKGJfMTA1NSA9PiBiXzEwNTUuYWRkU2NvcGUoc2NvcGVfMTA1MSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgYm9keVRlcm1fMTA1NCA9IG5ldyBUZXJtKFwiQmxvY2tcIiwge3N0YXRlbWVudHM6IGNvbXBpbGVyXzEwNTIuY29tcGlsZShtYXJrZWRCb2R5XzEwNTMpfSk7XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wb3AoKTtcbiAgICByZXR1cm4gYm9keVRlcm1fMTA1NDtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm1fMTA1Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTYuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fMTA1Nykge1xuICAgIGlmICh0ZXJtXzEwNTcuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGVybV8xMDU3O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTA1Ny5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRGVjbGFyYXRpb24odGVybV8xMDU4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NEZWNsYXJhdGlvblwiLCB7bmFtZTogdGVybV8xMDU4Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTgubmFtZSksIHN1cGVyOiB0ZXJtXzEwNTguc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNTguc3VwZXIpLCBlbGVtZW50czogdGVybV8xMDU4LmVsZW1lbnRzLm1hcChlbF8xMDU5ID0+IHRoaXMuZXhwYW5kKGVsXzEwNTkpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV8xMDYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFeHByZXNzaW9uXCIsIHtuYW1lOiB0ZXJtXzEwNjAubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA2MC5uYW1lKSwgc3VwZXI6IHRlcm1fMTA2MC5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA2MC5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzEwNjAuZWxlbWVudHMubWFwKGVsXzEwNjEgPT4gdGhpcy5leHBhbmQoZWxfMTA2MSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRWxlbWVudCh0ZXJtXzEwNjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzEwNjIuaXNTdGF0aWMsIG1ldGhvZDogdGhpcy5leHBhbmQodGVybV8xMDYyLm1ldGhvZCl9KTtcbiAgfVxuICBleHBhbmRUaGlzRXhwcmVzc2lvbih0ZXJtXzEwNjMpIHtcbiAgICByZXR1cm4gdGVybV8xMDYzO1xuICB9XG4gIGV4cGFuZFN5bnRheFRlbXBsYXRlKHRlcm1fMTA2NCkge1xuICAgIGxldCByXzEwNjUgPSBwcm9jZXNzVGVtcGxhdGUodGVybV8xMDY0LnRlbXBsYXRlLmlubmVyKCkpO1xuICAgIGxldCBzdHJfMTA2NiA9IFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHNlcmlhbGl6ZXIud3JpdGUocl8xMDY1LnRlbXBsYXRlKSk7XG4gICAgbGV0IGNhbGxlZV8xMDY3ID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIFwic3ludGF4VGVtcGxhdGVcIil9KTtcbiAgICBsZXQgZXhwYW5kZWRJbnRlcnBzXzEwNjggPSByXzEwNjUuaW50ZXJwLm1hcChpXzEwNzAgPT4ge1xuICAgICAgbGV0IGVuZl8xMDcxID0gbmV3IEVuZm9yZXN0ZXIoaV8xMDcwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmQoZW5mXzEwNzEuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpKTtcbiAgICB9KTtcbiAgICBsZXQgYXJnc18xMDY5ID0gTGlzdC5vZihuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogc3RyXzEwNjZ9KSkuY29uY2F0KGV4cGFuZGVkSW50ZXJwc18xMDY4KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTA2NywgYXJndW1lbnRzOiBhcmdzXzEwNjl9KTtcbiAgfVxuICBleHBhbmRTeW50YXhRdW90ZSh0ZXJtXzEwNzIpIHtcbiAgICBsZXQgc3RyXzEwNzMgPSBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgc2VyaWFsaXplci53cml0ZSh0ZXJtXzEwNzIubmFtZSkpfSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fMTA3Mi50ZW1wbGF0ZS50YWcsIGVsZW1lbnRzOiB0ZXJtXzEwNzIudGVtcGxhdGUuZWxlbWVudHMucHVzaChzdHJfMTA3MykucHVzaChuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IFwiXCJ9KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzEwNzQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTA3NC5vYmplY3QpLCBwcm9wZXJ0eTogdGVybV8xMDc0LnByb3BlcnR5fSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlFeHByZXNzaW9uKHRlcm1fMTA3NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHRlcm1fMTA3NS5lbGVtZW50cy5tYXAodF8xMDc2ID0+IHRfMTA3NiA9PSBudWxsID8gdF8xMDc2IDogdGhpcy5leHBhbmQodF8xMDc2KSl9KTtcbiAgfVxuICBleHBhbmRJbXBvcnQodGVybV8xMDc3KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3NztcbiAgfVxuICBleHBhbmRJbXBvcnROYW1lc3BhY2UodGVybV8xMDc4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3ODtcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV8xMDc5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV8xMDc5LmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydERlZmF1bHQodGVybV8xMDgwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV8xMDgwLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtXzEwODEpIHtcbiAgICByZXR1cm4gdGVybV8xMDgxO1xuICB9XG4gIGV4cGFuZEV4cG9ydEFsbEZyb20odGVybV8xMDgyKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MjtcbiAgfVxuICBleHBhbmRFeHBvcnRTcGVjaWZpZXIodGVybV8xMDgzKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MztcbiAgfVxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybV8xMDg0KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4NDtcbiAgfVxuICBleHBhbmREYXRhUHJvcGVydHkodGVybV8xMDg1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzEwODUubmFtZSksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTA4NS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEV4cHJlc3Npb24odGVybV8xMDg2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogdGVybV8xMDg2LnByb3BlcnRpZXMubWFwKHRfMTA4NyA9PiB0aGlzLmV4cGFuZCh0XzEwODcpKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRvcih0ZXJtXzEwODgpIHtcbiAgICBsZXQgaW5pdF8xMDg5ID0gdGVybV8xMDg4LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwODguaW5pdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzEwODguYmluZGluZyksIGluaXQ6IGluaXRfMTA4OX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb24odGVybV8xMDkwKSB7XG4gICAgaWYgKHRlcm1fMTA5MC5raW5kID09PSBcInN5bnRheFwiIHx8IHRlcm1fMTA5MC5raW5kID09PSBcInN5bnRheHJlY1wiKSB7XG4gICAgICByZXR1cm4gdGVybV8xMDkwO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiB0ZXJtXzEwOTAua2luZCwgZGVjbGFyYXRvcnM6IHRlcm1fMTA5MC5kZWNsYXJhdG9ycy5tYXAoZF8xMDkxID0+IHRoaXMuZXhwYW5kKGRfMTA5MSkpfSk7XG4gIH1cbiAgZXhwYW5kUGFyZW50aGVzaXplZEV4cHJlc3Npb24odGVybV8xMDkyKSB7XG4gICAgaWYgKHRlcm1fMTA5Mi5pbm5lci5zaXplID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl8xMDkzID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDkyLmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMDk0ID0gZW5mXzEwOTMucGVlaygpO1xuICAgIGxldCB0XzEwOTUgPSBlbmZfMTA5My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodF8xMDk1ID09IG51bGwgfHwgZW5mXzEwOTMucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzEwOTMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEwOTQsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4cGFuZCh0XzEwOTUpO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzEwOTYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVbmFyeUV4cHJlc3Npb25cIiwge29wZXJhdG9yOiB0ZXJtXzEwOTYub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fMTA5Ni5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV8xMDk3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IHRlcm1fMTA5Ny5pc1ByZWZpeCwgb3BlcmF0b3I6IHRlcm1fMTA5Ny5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV8xMDk3Lm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kQmluYXJ5RXhwcmVzc2lvbih0ZXJtXzEwOTgpIHtcbiAgICBsZXQgbGVmdF8xMDk5ID0gdGhpcy5leHBhbmQodGVybV8xMDk4LmxlZnQpO1xuICAgIGxldCByaWdodF8xMTAwID0gdGhpcy5leHBhbmQodGVybV8xMDk4LnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzEwOTksIG9wZXJhdG9yOiB0ZXJtXzEwOTgub3BlcmF0b3IsIHJpZ2h0OiByaWdodF8xMTAwfSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fMTEwMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMTAxLnRlc3QpLCBjb25zZXF1ZW50OiB0aGlzLmV4cGFuZCh0ZXJtXzExMDEuY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV8xMTAxLmFsdGVybmF0ZSl9KTtcbiAgfVxuICBleHBhbmROZXdUYXJnZXRFeHByZXNzaW9uKHRlcm1fMTEwMikge1xuICAgIHJldHVybiB0ZXJtXzExMDI7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzExMDMpIHtcbiAgICBsZXQgY2FsbGVlXzExMDQgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMDMuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzExMDUgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzExMDMuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfMTEwNiA9IGVuZl8xMTA1LmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ18xMTA3ID0+IHRoaXMuZXhwYW5kKGFyZ18xMTA3KSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTEwNCwgYXJndW1lbnRzOiBhcmdzXzExMDYudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3VwZXIodGVybV8xMTA4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTEwODtcbiAgfVxuICBleHBhbmRDYWxsRXhwcmVzc2lvbih0ZXJtXzExMDkpIHtcbiAgICBsZXQgY2FsbGVlXzExMTAgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMDkuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzExMTEgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzExMDkuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfMTExMiA9IGVuZl8xMTExLmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ18xMTEzID0+IHRoaXMuZXhwYW5kKGFyZ18xMTEzKSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzExMTAsIGFyZ3VtZW50czogYXJnc18xMTEyfSk7XG4gIH1cbiAgZXhwYW5kU3ByZWFkRWxlbWVudCh0ZXJtXzExMTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzExMTQuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFeHByZXNzaW9uU3RhdGVtZW50KHRlcm1fMTExNSkge1xuICAgIGxldCBjaGlsZF8xMTE2ID0gdGhpcy5leHBhbmQodGVybV8xMTE1LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGNoaWxkXzExMTZ9KTtcbiAgfVxuICBleHBhbmRMYWJlbGVkU3RhdGVtZW50KHRlcm1fMTExNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxhYmVsZWRTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzExMTcubGFiZWwudmFsKCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTExNy5ib2R5KX0pO1xuICB9XG4gIGRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTE4LCB0eXBlXzExMTkpIHtcbiAgICBsZXQgc2NvcGVfMTEyMCA9IGZyZXNoU2NvcGUoXCJmdW5cIik7XG4gICAgbGV0IHJlZF8xMTIxID0gbmV3IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIoc2NvcGVfMTEyMCwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcGFyYW1zXzExMjI7XG4gICAgaWYgKHR5cGVfMTExOSAhPT0gXCJHZXR0ZXJcIiAmJiB0eXBlXzExMTkgIT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHBhcmFtc18xMTIyID0gcmVkXzExMjEudHJhbnNmb3JtKHRlcm1fMTExOC5wYXJhbXMpO1xuICAgICAgcGFyYW1zXzExMjIgPSB0aGlzLmV4cGFuZChwYXJhbXNfMTEyMik7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucHVzaChzY29wZV8xMTIwKTtcbiAgICBsZXQgY29tcGlsZXJfMTEyMyA9IG5ldyBDb21waWxlcih0aGlzLmNvbnRleHQucGhhc2UsIHRoaXMuY29udGV4dC5lbnYsIHRoaXMuY29udGV4dC5zdG9yZSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbWFya2VkQm9keV8xMTI0LCBib2R5VGVybV8xMTI1O1xuICAgIGlmICh0ZXJtXzExMTguYm9keSBpbnN0YW5jZW9mIFRlcm0pIHtcbiAgICAgIGJvZHlUZXJtXzExMjUgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMTguYm9keS5hZGRTY29wZShzY29wZV8xMTIwLCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya2VkQm9keV8xMTI0ID0gdGVybV8xMTE4LmJvZHkubWFwKGJfMTEyNiA9PiBiXzExMjYuYWRkU2NvcGUoc2NvcGVfMTEyMCwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgICBib2R5VGVybV8xMTI1ID0gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgc3RhdGVtZW50czogY29tcGlsZXJfMTEyMy5jb21waWxlKG1hcmtlZEJvZHlfMTEyNCl9KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wb3AoKTtcbiAgICBpZiAodHlwZV8xMTE5ID09PSBcIkdldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMTE5LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMTE4Lm5hbWUpLCBib2R5OiBib2R5VGVybV8xMTI1fSk7XG4gICAgfSBlbHNlIGlmICh0eXBlXzExMTkgPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzExMTksIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzExMTgubmFtZSksIHBhcmFtOiB0ZXJtXzExMTgucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzExMjV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTExOSwge25hbWU6IHRlcm1fMTExOC5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV8xMTE4LmlzR2VuZXJhdG9yLCBwYXJhbXM6IHBhcmFtc18xMTIyLCBib2R5OiBib2R5VGVybV8xMTI1fSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fMTEyNykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTI3LCBcIk1ldGhvZFwiKTtcbiAgfVxuICBleHBhbmRTZXR0ZXIodGVybV8xMTI4KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzExMjgsIFwiU2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEdldHRlcih0ZXJtXzExMjkpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTEyOSwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzExMzApIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTEzMCwgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRXhwcmVzc2lvbih0ZXJtXzExMzEpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTEzMSwgXCJGdW5jdGlvbkV4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzExMzIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzExMzIuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzExMzIub3BlcmF0b3IsIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTEzMi5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fMTEzMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzExMzMuYmluZGluZyksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTEzMy5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEVtcHR5U3RhdGVtZW50KHRlcm1fMTEzNCkge1xuICAgIHJldHVybiB0ZXJtXzExMzQ7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uKHRlcm1fMTEzNSkge1xuICAgIHJldHVybiB0ZXJtXzExMzU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fMTEzNikge1xuICAgIHJldHVybiB0ZXJtXzExMzY7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbih0ZXJtXzExMzcpIHtcbiAgICByZXR1cm4gdGVybV8xMTM3O1xuICB9XG4gIGV4cGFuZElkZW50aWZpZXJFeHByZXNzaW9uKHRlcm1fMTEzOCkge1xuICAgIGxldCB0cmFuc18xMTM5ID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8xMTM4Lm5hbWUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKTtcbiAgICBpZiAodHJhbnNfMTEzOSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRyYW5zXzExMzkuaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fMTEzODtcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVsbEV4cHJlc3Npb24odGVybV8xMTQwKSB7XG4gICAgcmV0dXJuIHRlcm1fMTE0MDtcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzExNDEpIHtcbiAgICByZXR1cm4gdGVybV8xMTQxO1xuICB9XG4gIGV4cGFuZExpdGVyYWxSZWdFeHBFeHByZXNzaW9uKHRlcm1fMTE0Mikge1xuICAgIHJldHVybiB0ZXJtXzExNDI7XG4gIH1cbn1cbiJdfQ==