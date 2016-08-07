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
  constructor(context_988) {
    super("expand", true);
    this.context = context_988;
  }
  expand(term_989) {
    return this.dispatch(term_989);
  }
  expandPragma(term_990) {
    return term_990;
  }
  expandTemplateExpression(term_991) {
    return new _terms2.default("TemplateExpression", { tag: term_991.tag == null ? null : this.expand(term_991.tag), elements: term_991.elements.toArray() });
  }
  expandBreakStatement(term_992) {
    return new _terms2.default("BreakStatement", { label: term_992.label ? term_992.label.val() : null });
  }
  expandDoWhileStatement(term_993) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_993.body), test: this.expand(term_993.test) });
  }
  expandWithStatement(term_994) {
    return new _terms2.default("WithStatement", { body: this.expand(term_994.body), object: this.expand(term_994.object) });
  }
  expandDebuggerStatement(term_995) {
    return term_995;
  }
  expandContinueStatement(term_996) {
    return new _terms2.default("ContinueStatement", { label: term_996.label ? term_996.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_997) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_997.discriminant), preDefaultCases: term_997.preDefaultCases.map(c_998 => this.expand(c_998)).toArray(), defaultCase: this.expand(term_997.defaultCase), postDefaultCases: term_997.postDefaultCases.map(c_999 => this.expand(c_999)).toArray() });
  }
  expandComputedMemberExpression(term_1000) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_1000.object), expression: this.expand(term_1000.expression) });
  }
  expandSwitchStatement(term_1001) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_1001.discriminant), cases: term_1001.cases.map(c_1002 => this.expand(c_1002)).toArray() });
  }
  expandFormalParameters(term_1003) {
    let rest_1004 = term_1003.rest == null ? null : this.expand(term_1003.rest);
    return new _terms2.default("FormalParameters", { items: term_1003.items.map(i_1005 => this.expand(i_1005)), rest: rest_1004 });
  }
  expandArrowExpression(term_1006) {
    return this.doFunctionExpansion(term_1006, "ArrowExpression");
  }
  expandSwitchDefault(term_1007) {
    return new _terms2.default("SwitchDefault", { consequent: term_1007.consequent.map(c_1008 => this.expand(c_1008)).toArray() });
  }
  expandSwitchCase(term_1009) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_1009.test), consequent: term_1009.consequent.map(c_1010 => this.expand(c_1010)).toArray() });
  }
  expandForInStatement(term_1011) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_1011.left), right: this.expand(term_1011.right), body: this.expand(term_1011.body) });
  }
  expandTryCatchStatement(term_1012) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_1012.body), catchClause: this.expand(term_1012.catchClause) });
  }
  expandTryFinallyStatement(term_1013) {
    let catchClause_1014 = term_1013.catchClause == null ? null : this.expand(term_1013.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_1013.body), catchClause: catchClause_1014, finalizer: this.expand(term_1013.finalizer) });
  }
  expandCatchClause(term_1015) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_1015.binding), body: this.expand(term_1015.body) });
  }
  expandThrowStatement(term_1016) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_1016.expression) });
  }
  expandForOfStatement(term_1017) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_1017.left), right: this.expand(term_1017.right), body: this.expand(term_1017.body) });
  }
  expandBindingIdentifier(term_1018) {
    return term_1018;
  }
  expandBindingPropertyIdentifier(term_1019) {
    return term_1019;
  }
  expandBindingPropertyProperty(term_1020) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_1020.name), binding: this.expand(term_1020.binding) });
  }
  expandComputedPropertyName(term_1021) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_1021.expression) });
  }
  expandObjectBinding(term_1022) {
    return new _terms2.default("ObjectBinding", { properties: term_1022.properties.map(t_1023 => this.expand(t_1023)).toArray() });
  }
  expandArrayBinding(term_1024) {
    let restElement_1025 = term_1024.restElement == null ? null : this.expand(term_1024.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_1024.elements.map(t_1026 => t_1026 == null ? null : this.expand(t_1026)).toArray(), restElement: restElement_1025 });
  }
  expandBindingWithDefault(term_1027) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_1027.binding), init: this.expand(term_1027.init) });
  }
  expandShorthandProperty(term_1028) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_1028.name }), expression: new _terms2.default("IdentifierExpression", { name: term_1028.name }) });
  }
  expandForStatement(term_1029) {
    let init_1030 = term_1029.init == null ? null : this.expand(term_1029.init);
    let test_1031 = term_1029.test == null ? null : this.expand(term_1029.test);
    let update_1032 = term_1029.update == null ? null : this.expand(term_1029.update);
    let body_1033 = this.expand(term_1029.body);
    return new _terms2.default("ForStatement", { init: init_1030, test: test_1031, update: update_1032, body: body_1033 });
  }
  expandYieldExpression(term_1034) {
    let expr_1035 = term_1034.expression == null ? null : this.expand(term_1034.expression);
    return new _terms2.default("YieldExpression", { expression: expr_1035 });
  }
  expandYieldGeneratorExpression(term_1036) {
    let expr_1037 = term_1036.expression == null ? null : this.expand(term_1036.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_1037 });
  }
  expandWhileStatement(term_1038) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_1038.test), body: this.expand(term_1038.body) });
  }
  expandIfStatement(term_1039) {
    let consequent_1040 = term_1039.consequent == null ? null : this.expand(term_1039.consequent);
    let alternate_1041 = term_1039.alternate == null ? null : this.expand(term_1039.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_1039.test), consequent: consequent_1040, alternate: alternate_1041 });
  }
  expandBlockStatement(term_1042) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_1042.block) });
  }
  expandBlock(term_1043) {
    return new _terms2.default("Block", { statements: term_1043.statements.map(s_1044 => this.expand(s_1044)).toArray() });
  }
  expandVariableDeclarationStatement(term_1045) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_1045.declaration) });
  }
  expandReturnStatement(term_1046) {
    if (term_1046.expression == null) {
      return term_1046;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_1046.expression) });
  }
  expandClassDeclaration(term_1047) {
    return new _terms2.default("ClassDeclaration", { name: term_1047.name == null ? null : this.expand(term_1047.name), super: term_1047.super == null ? null : this.expand(term_1047.super), elements: term_1047.elements.map(el_1048 => this.expand(el_1048)).toArray() });
  }
  expandClassExpression(term_1049) {
    return new _terms2.default("ClassExpression", { name: term_1049.name == null ? null : this.expand(term_1049.name), super: term_1049.super == null ? null : this.expand(term_1049.super), elements: term_1049.elements.map(el_1050 => this.expand(el_1050)).toArray() });
  }
  expandClassElement(term_1051) {
    return new _terms2.default("ClassElement", { isStatic: term_1051.isStatic, method: this.expand(term_1051.method) });
  }
  expandThisExpression(term_1052) {
    return term_1052;
  }
  expandSyntaxTemplate(term_1053) {
    let r_1054 = (0, _templateProcessor.processTemplate)(term_1053.template.inner());
    let str_1055 = _syntax2.default.from("string", _serializer.serializer.write(r_1054.template));
    let callee_1056 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1057 = r_1054.interp.map(i_1059 => {
      let enf_1060 = new _enforester.Enforester(i_1059, (0, _immutable.List)(), this.context);
      return this.expand(enf_1060.enforest("expression"));
    });
    let args_1058 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1055 })).concat(expandedInterps_1057);
    return new _terms2.default("CallExpression", { callee: callee_1056, arguments: args_1058 });
  }
  expandSyntaxQuote(term_1061) {
    let str_1062 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1061.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1061.template.tag, elements: term_1061.template.elements.push(str_1062).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1063) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1063.object), property: term_1063.property });
  }
  expandArrayExpression(term_1064) {
    return new _terms2.default("ArrayExpression", { elements: term_1064.elements.map(t_1065 => t_1065 == null ? t_1065 : this.expand(t_1065)) });
  }
  expandImport(term_1066) {
    return term_1066;
  }
  expandImportNamespace(term_1067) {
    return term_1067;
  }
  expandExport(term_1068) {
    return new _terms2.default("Export", { declaration: this.expand(term_1068.declaration) });
  }
  expandExportDefault(term_1069) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1069.body) });
  }
  expandExportFrom(term_1070) {
    return term_1070;
  }
  expandExportAllFrom(term_1071) {
    return term_1071;
  }
  expandExportSpecifier(term_1072) {
    return term_1072;
  }
  expandStaticPropertyName(term_1073) {
    return term_1073;
  }
  expandDataProperty(term_1074) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1074.name), expression: this.expand(term_1074.expression) });
  }
  expandObjectExpression(term_1075) {
    return new _terms2.default("ObjectExpression", { properties: term_1075.properties.map(t_1076 => this.expand(t_1076)) });
  }
  expandVariableDeclarator(term_1077) {
    let init_1078 = term_1077.init == null ? null : this.expand(term_1077.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1077.binding), init: init_1078 });
  }
  expandVariableDeclaration(term_1079) {
    if (term_1079.kind === "syntax" || term_1079.kind === "syntaxrec") {
      return term_1079;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1079.kind, declarators: term_1079.declarators.map(d_1080 => this.expand(d_1080)) });
  }
  expandParenthesizedExpression(term_1081) {
    if (term_1081.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1082 = new _enforester.Enforester(term_1081.inner, (0, _immutable.List)(), this.context);
    let lookahead_1083 = enf_1082.peek();
    let t_1084 = enf_1082.enforestExpression();
    if (t_1084 == null || enf_1082.rest.size > 0) {
      throw enf_1082.createError(lookahead_1083, "unexpected syntax");
    }
    return this.expand(t_1084);
  }
  expandUnaryExpression(term_1085) {
    return new _terms2.default("UnaryExpression", { operator: term_1085.operator, operand: this.expand(term_1085.operand) });
  }
  expandUpdateExpression(term_1086) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1086.isPrefix, operator: term_1086.operator, operand: this.expand(term_1086.operand) });
  }
  expandBinaryExpression(term_1087) {
    let left_1088 = this.expand(term_1087.left);
    let right_1089 = this.expand(term_1087.right);
    return new _terms2.default("BinaryExpression", { left: left_1088, operator: term_1087.operator, right: right_1089 });
  }
  expandConditionalExpression(term_1090) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1090.test), consequent: this.expand(term_1090.consequent), alternate: this.expand(term_1090.alternate) });
  }
  expandNewTargetExpression(term_1091) {
    return term_1091;
  }
  expandNewExpression(term_1092) {
    let callee_1093 = this.expand(term_1092.callee);
    let enf_1094 = new _enforester.Enforester(term_1092.arguments, (0, _immutable.List)(), this.context);
    let args_1095 = enf_1094.enforestArgumentList().map(arg_1096 => this.expand(arg_1096));
    return new _terms2.default("NewExpression", { callee: callee_1093, arguments: args_1095.toArray() });
  }
  expandSuper(term_1097) {
    return term_1097;
  }
  expandCallExpression(term_1098) {
    let callee_1099 = this.expand(term_1098.callee);
    let enf_1100 = new _enforester.Enforester(term_1098.arguments, (0, _immutable.List)(), this.context);
    let args_1101 = enf_1100.enforestArgumentList().map(arg_1102 => this.expand(arg_1102));
    return new _terms2.default("CallExpression", { callee: callee_1099, arguments: args_1101 });
  }
  expandSpreadElement(term_1103) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1103.expression) });
  }
  expandExpressionStatement(term_1104) {
    let child_1105 = this.expand(term_1104.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1105 });
  }
  expandLabeledStatement(term_1106) {
    return new _terms2.default("LabeledStatement", { label: term_1106.label.val(), body: this.expand(term_1106.body) });
  }
  doFunctionExpansion(term_1107, type_1108) {
    let scope_1109 = (0, _scope.freshScope)("fun");
    let red_1110 = new _applyScopeInParamsReducer2.default(scope_1109, this.context);
    let params_1111;
    if (type_1108 !== "Getter" && type_1108 !== "Setter") {
      params_1111 = red_1110.transform(term_1107.params);
      params_1111 = this.expand(params_1111);
    }
    this.context.currentScope.push(scope_1109);
    let compiler_1112 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1113, bodyTerm_1114;
    if (term_1107.body instanceof _terms2.default) {
      bodyTerm_1114 = this.expand(term_1107.body.addScope(scope_1109, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1113 = term_1107.body.map(b_1115 => b_1115.addScope(scope_1109, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1114 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1112.compile(markedBody_1113) });
    }
    this.context.currentScope.pop();
    if (type_1108 === "Getter") {
      return new _terms2.default(type_1108, { name: this.expand(term_1107.name), body: bodyTerm_1114 });
    } else if (type_1108 === "Setter") {
      return new _terms2.default(type_1108, { name: this.expand(term_1107.name), param: term_1107.param, body: bodyTerm_1114 });
    }
    return new _terms2.default(type_1108, { name: term_1107.name, isGenerator: term_1107.isGenerator, params: params_1111, body: bodyTerm_1114 });
  }
  expandMethod(term_1116) {
    return this.doFunctionExpansion(term_1116, "Method");
  }
  expandSetter(term_1117) {
    return this.doFunctionExpansion(term_1117, "Setter");
  }
  expandGetter(term_1118) {
    return this.doFunctionExpansion(term_1118, "Getter");
  }
  expandFunctionDeclaration(term_1119) {
    return this.doFunctionExpansion(term_1119, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1120) {
    return this.doFunctionExpansion(term_1120, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1121) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1121.binding), operator: term_1121.operator, expression: this.expand(term_1121.expression) });
  }
  expandAssignmentExpression(term_1122) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1122.binding), expression: this.expand(term_1122.expression) });
  }
  expandEmptyStatement(term_1123) {
    return term_1123;
  }
  expandLiteralBooleanExpression(term_1124) {
    return term_1124;
  }
  expandLiteralNumericExpression(term_1125) {
    return term_1125;
  }
  expandLiteralInfinityExpression(term_1126) {
    return term_1126;
  }
  expandIdentifierExpression(term_1127) {
    let trans_1128 = this.context.env.get(term_1127.name.resolve(this.context.phase));
    if (trans_1128) {
      return new _terms2.default("IdentifierExpression", { name: trans_1128.id });
    }
    return term_1127;
  }
  expandLiteralNullExpression(term_1129) {
    return term_1129;
  }
  expandLiteralStringExpression(term_1130) {
    return term_1130;
  }
  expandLiteralRegExpExpression(term_1131) {
    return term_1131;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUFQLEVBQW1DLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUF6QyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsUUFBcEIsRUFBOEI7QUFDNUIsV0FBTyxvQkFBUyxlQUFULEVBQTBC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QU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxNQUFNLFdBQVcsRUFBbEIsRUFBakMsQ0FBUDtBQUNEO0FBQ0QsV0FBTyxTQUFQO0FBQ0Q7QUFDRCw4QkFBNEIsU0FBNUIsRUFBdUM7QUFDckMsV0FBTyxTQUFQO0FBQ0Q7QUFDRCxnQ0FBOEIsU0FBOUIsRUFBeUM7QUFDdkMsV0FBTyxTQUFQO0FBQ0Q7QUFDRCxnQ0FBOEIsU0FBOUIsRUFBeUM7QUFDdkMsV0FBTyxTQUFQO0FBQ0Q7QUE3VXFEO2tCQUFuQyxZIiwiZmlsZSI6InRlcm0tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge1Njb3BlLCBmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIgZnJvbSBcIi4vYXBwbHktc2NvcGUtaW4tcGFyYW1zLXJlZHVjZXJcIjtcbmltcG9ydCByZWR1Y2VyLCB7TW9ub2lkYWxSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IENvbXBpbGVyIGZyb20gXCIuL2NvbXBpbGVyXCI7XG5pbXBvcnQgU3ludGF4LCB7QUxMX1BIQVNFU30gZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQge3NlcmlhbGl6ZXIsIG1ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge3Byb2Nlc3NUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yLmpzXCI7XG5pbXBvcnQgQVNURGlzcGF0Y2hlciBmcm9tIFwiLi9hc3QtZGlzcGF0Y2hlclwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybUV4cGFuZGVyIGV4dGVuZHMgQVNURGlzcGF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfOTg4KSB7XG4gICAgc3VwZXIoXCJleHBhbmRcIiwgdHJ1ZSk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF85ODg7XG4gIH1cbiAgZXhwYW5kKHRlcm1fOTg5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2godGVybV85ODkpO1xuICB9XG4gIGV4cGFuZFByYWdtYSh0ZXJtXzk5MCkge1xuICAgIHJldHVybiB0ZXJtXzk5MDtcbiAgfVxuICBleHBhbmRUZW1wbGF0ZUV4cHJlc3Npb24odGVybV85OTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV85OTEudGFnID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTEudGFnKSwgZWxlbWVudHM6IHRlcm1fOTkxLmVsZW1lbnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEJyZWFrU3RhdGVtZW50KHRlcm1fOTkyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzk5Mi5sYWJlbCA/IHRlcm1fOTkyLmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZERvV2hpbGVTdGF0ZW1lbnQodGVybV85OTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk5My5ib2R5KSwgdGVzdDogdGhpcy5leHBhbmQodGVybV85OTMudGVzdCl9KTtcbiAgfVxuICBleHBhbmRXaXRoU3RhdGVtZW50KHRlcm1fOTk0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV85OTQuYm9keSksIG9iamVjdDogdGhpcy5leHBhbmQodGVybV85OTQub2JqZWN0KX0pO1xuICB9XG4gIGV4cGFuZERlYnVnZ2VyU3RhdGVtZW50KHRlcm1fOTk1KSB7XG4gICAgcmV0dXJuIHRlcm1fOTk1O1xuICB9XG4gIGV4cGFuZENvbnRpbnVlU3RhdGVtZW50KHRlcm1fOTk2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzk5Ni5sYWJlbCA/IHRlcm1fOTk2LmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0KHRlcm1fOTk3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV85OTcuZGlzY3JpbWluYW50KSwgcHJlRGVmYXVsdENhc2VzOiB0ZXJtXzk5Ny5wcmVEZWZhdWx0Q2FzZXMubWFwKGNfOTk4ID0+IHRoaXMuZXhwYW5kKGNfOTk4KSkudG9BcnJheSgpLCBkZWZhdWx0Q2FzZTogdGhpcy5leHBhbmQodGVybV85OTcuZGVmYXVsdENhc2UpLCBwb3N0RGVmYXVsdENhc2VzOiB0ZXJtXzk5Ny5wb3N0RGVmYXVsdENhc2VzLm1hcChjXzk5OSA9PiB0aGlzLmV4cGFuZChjXzk5OSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzEwMDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV8xMDAwLm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTAwMC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudCh0ZXJtXzEwMDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV8xMDAxLmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzEwMDEuY2FzZXMubWFwKGNfMTAwMiA9PiB0aGlzLmV4cGFuZChjXzEwMDIpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fMTAwMykge1xuICAgIGxldCByZXN0XzEwMDQgPSB0ZXJtXzEwMDMucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAwMy5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogdGVybV8xMDAzLml0ZW1zLm1hcChpXzEwMDUgPT4gdGhpcy5leHBhbmQoaV8xMDA1KSksIHJlc3Q6IHJlc3RfMTAwNH0pO1xuICB9XG4gIGV4cGFuZEFycm93RXhwcmVzc2lvbih0ZXJtXzEwMDYpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTAwNiwgXCJBcnJvd0V4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtXzEwMDcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0ZXJtXzEwMDcuY29uc2VxdWVudC5tYXAoY18xMDA4ID0+IHRoaXMuZXhwYW5kKGNfMTAwOCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaENhc2UodGVybV8xMDA5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMDA5LnRlc3QpLCBjb25zZXF1ZW50OiB0ZXJtXzEwMDkuY29uc2VxdWVudC5tYXAoY18xMDEwID0+IHRoaXMuZXhwYW5kKGNfMTAxMCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEZvckluU3RhdGVtZW50KHRlcm1fMTAxMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvckluU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTEubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTEucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTEuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUcnlDYXRjaFN0YXRlbWVudCh0ZXJtXzEwMTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV8xMDEyLmJvZHkpLCBjYXRjaENsYXVzZTogdGhpcy5leHBhbmQodGVybV8xMDEyLmNhdGNoQ2xhdXNlKX0pO1xuICB9XG4gIGV4cGFuZFRyeUZpbmFsbHlTdGF0ZW1lbnQodGVybV8xMDEzKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzEwMTQgPSB0ZXJtXzEwMTMuY2F0Y2hDbGF1c2UgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTMuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAxMy5ib2R5KSwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlXzEwMTQsIGZpbmFsaXplcjogdGhpcy5leHBhbmQodGVybV8xMDEzLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzEwMTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDE1LmJpbmRpbmcpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTUuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzEwMTYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDE2LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRm9yT2ZTdGF0ZW1lbnQodGVybV8xMDE3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNy5sZWZ0KSwgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNy5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAxNy5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fMTAxOCkge1xuICAgIHJldHVybiB0ZXJtXzEwMTg7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtXzEwMTkpIHtcbiAgICByZXR1cm4gdGVybV8xMDE5O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5KHRlcm1fMTAyMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjAubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTAyMC5iaW5kaW5nKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkUHJvcGVydHlOYW1lKHRlcm1fMTAyMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjEuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fMTAyMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTAyMi5wcm9wZXJ0aWVzLm1hcCh0XzEwMjMgPT4gdGhpcy5leHBhbmQodF8xMDIzKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm1fMTAyNCkge1xuICAgIGxldCByZXN0RWxlbWVudF8xMDI1ID0gdGVybV8xMDI0LnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDI0LnJlc3RFbGVtZW50KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzEwMjQuZWxlbWVudHMubWFwKHRfMTAyNiA9PiB0XzEwMjYgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0XzEwMjYpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMDI1fSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1dpdGhEZWZhdWx0KHRlcm1fMTAyNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDI3LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjcuaW5pdCl9KTtcbiAgfVxuICBleHBhbmRTaG9ydGhhbmRQcm9wZXJ0eSh0ZXJtXzEwMjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGVybV8xMDI4Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV8xMDI4Lm5hbWV9KX0pO1xuICB9XG4gIGV4cGFuZEZvclN0YXRlbWVudCh0ZXJtXzEwMjkpIHtcbiAgICBsZXQgaW5pdF8xMDMwID0gdGVybV8xMDI5LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjkuaW5pdCk7XG4gICAgbGV0IHRlc3RfMTAzMSA9IHRlcm1fMTAyOS50ZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDI5LnRlc3QpO1xuICAgIGxldCB1cGRhdGVfMTAzMiA9IHRlcm1fMTAyOS51cGRhdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjkudXBkYXRlKTtcbiAgICBsZXQgYm9keV8xMDMzID0gdGhpcy5leHBhbmQodGVybV8xMDI5LmJvZHkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF8xMDMwLCB0ZXN0OiB0ZXN0XzEwMzEsIHVwZGF0ZTogdXBkYXRlXzEwMzIsIGJvZHk6IGJvZHlfMTAzM30pO1xuICB9XG4gIGV4cGFuZFlpZWxkRXhwcmVzc2lvbih0ZXJtXzEwMzQpIHtcbiAgICBsZXQgZXhwcl8xMDM1ID0gdGVybV8xMDM0LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzQuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzEwMzV9KTtcbiAgfVxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybV8xMDM2KSB7XG4gICAgbGV0IGV4cHJfMTAzNyA9IHRlcm1fMTAzNi5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDM2LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xMDM3fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV8xMDM4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAzOC50ZXN0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMDM4LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV8xMDM5KSB7XG4gICAgbGV0IGNvbnNlcXVlbnRfMTA0MCA9IHRlcm1fMTAzOS5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDM5LmNvbnNlcXVlbnQpO1xuICAgIGxldCBhbHRlcm5hdGVfMTA0MSA9IHRlcm1fMTAzOS5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzkuYWx0ZXJuYXRlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMDM5LnRlc3QpLCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzEwNDAsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzEwNDF9KTtcbiAgfVxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtXzEwNDIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Mi5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzEwNDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogdGVybV8xMDQzLnN0YXRlbWVudHMubWFwKHNfMTA0NCA9PiB0aGlzLmV4cGFuZChzXzEwNDQpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm1fMTA0NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDUuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fMTA0Nikge1xuICAgIGlmICh0ZXJtXzEwNDYuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGVybV8xMDQ2O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTA0Ni5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRGVjbGFyYXRpb24odGVybV8xMDQ3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NEZWNsYXJhdGlvblwiLCB7bmFtZTogdGVybV8xMDQ3Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDcubmFtZSksIHN1cGVyOiB0ZXJtXzEwNDcuc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDcuc3VwZXIpLCBlbGVtZW50czogdGVybV8xMDQ3LmVsZW1lbnRzLm1hcChlbF8xMDQ4ID0+IHRoaXMuZXhwYW5kKGVsXzEwNDgpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV8xMDQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFeHByZXNzaW9uXCIsIHtuYW1lOiB0ZXJtXzEwNDkubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA0OS5uYW1lKSwgc3VwZXI6IHRlcm1fMTA0OS5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTA0OS5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzEwNDkuZWxlbWVudHMubWFwKGVsXzEwNTAgPT4gdGhpcy5leHBhbmQoZWxfMTA1MCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRWxlbWVudCh0ZXJtXzEwNTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzEwNTEuaXNTdGF0aWMsIG1ldGhvZDogdGhpcy5leHBhbmQodGVybV8xMDUxLm1ldGhvZCl9KTtcbiAgfVxuICBleHBhbmRUaGlzRXhwcmVzc2lvbih0ZXJtXzEwNTIpIHtcbiAgICByZXR1cm4gdGVybV8xMDUyO1xuICB9XG4gIGV4cGFuZFN5bnRheFRlbXBsYXRlKHRlcm1fMTA1Mykge1xuICAgIGxldCByXzEwNTQgPSBwcm9jZXNzVGVtcGxhdGUodGVybV8xMDUzLnRlbXBsYXRlLmlubmVyKCkpO1xuICAgIGxldCBzdHJfMTA1NSA9IFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHNlcmlhbGl6ZXIud3JpdGUocl8xMDU0LnRlbXBsYXRlKSk7XG4gICAgbGV0IGNhbGxlZV8xMDU2ID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIFwic3ludGF4VGVtcGxhdGVcIil9KTtcbiAgICBsZXQgZXhwYW5kZWRJbnRlcnBzXzEwNTcgPSByXzEwNTQuaW50ZXJwLm1hcChpXzEwNTkgPT4ge1xuICAgICAgbGV0IGVuZl8xMDYwID0gbmV3IEVuZm9yZXN0ZXIoaV8xMDU5LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmQoZW5mXzEwNjAuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpKTtcbiAgICB9KTtcbiAgICBsZXQgYXJnc18xMDU4ID0gTGlzdC5vZihuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogc3RyXzEwNTV9KSkuY29uY2F0KGV4cGFuZGVkSW50ZXJwc18xMDU3KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTA1NiwgYXJndW1lbnRzOiBhcmdzXzEwNTh9KTtcbiAgfVxuICBleHBhbmRTeW50YXhRdW90ZSh0ZXJtXzEwNjEpIHtcbiAgICBsZXQgc3RyXzEwNjIgPSBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgc2VyaWFsaXplci53cml0ZSh0ZXJtXzEwNjEubmFtZSkpfSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fMTA2MS50ZW1wbGF0ZS50YWcsIGVsZW1lbnRzOiB0ZXJtXzEwNjEudGVtcGxhdGUuZWxlbWVudHMucHVzaChzdHJfMTA2MikucHVzaChuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IFwiXCJ9KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzEwNjMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTA2My5vYmplY3QpLCBwcm9wZXJ0eTogdGVybV8xMDYzLnByb3BlcnR5fSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlFeHByZXNzaW9uKHRlcm1fMTA2NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHRlcm1fMTA2NC5lbGVtZW50cy5tYXAodF8xMDY1ID0+IHRfMTA2NSA9PSBudWxsID8gdF8xMDY1IDogdGhpcy5leHBhbmQodF8xMDY1KSl9KTtcbiAgfVxuICBleHBhbmRJbXBvcnQodGVybV8xMDY2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA2NjtcbiAgfVxuICBleHBhbmRJbXBvcnROYW1lc3BhY2UodGVybV8xMDY3KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA2NztcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV8xMDY4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV8xMDY4LmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydERlZmF1bHQodGVybV8xMDY5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV8xMDY5LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtXzEwNzApIHtcbiAgICByZXR1cm4gdGVybV8xMDcwO1xuICB9XG4gIGV4cGFuZEV4cG9ydEFsbEZyb20odGVybV8xMDcxKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3MTtcbiAgfVxuICBleHBhbmRFeHBvcnRTcGVjaWZpZXIodGVybV8xMDcyKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3MjtcbiAgfVxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybV8xMDczKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA3MztcbiAgfVxuICBleHBhbmREYXRhUHJvcGVydHkodGVybV8xMDc0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzQubmFtZSksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTA3NC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEV4cHJlc3Npb24odGVybV8xMDc1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogdGVybV8xMDc1LnByb3BlcnRpZXMubWFwKHRfMTA3NiA9PiB0aGlzLmV4cGFuZCh0XzEwNzYpKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRvcih0ZXJtXzEwNzcpIHtcbiAgICBsZXQgaW5pdF8xMDc4ID0gdGVybV8xMDc3LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzcuaW5pdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzcuYmluZGluZyksIGluaXQ6IGluaXRfMTA3OH0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb24odGVybV8xMDc5KSB7XG4gICAgaWYgKHRlcm1fMTA3OS5raW5kID09PSBcInN5bnRheFwiIHx8IHRlcm1fMTA3OS5raW5kID09PSBcInN5bnRheHJlY1wiKSB7XG4gICAgICByZXR1cm4gdGVybV8xMDc5O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiB0ZXJtXzEwNzkua2luZCwgZGVjbGFyYXRvcnM6IHRlcm1fMTA3OS5kZWNsYXJhdG9ycy5tYXAoZF8xMDgwID0+IHRoaXMuZXhwYW5kKGRfMTA4MCkpfSk7XG4gIH1cbiAgZXhwYW5kUGFyZW50aGVzaXplZEV4cHJlc3Npb24odGVybV8xMDgxKSB7XG4gICAgaWYgKHRlcm1fMTA4MS5pbm5lci5zaXplID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl8xMDgyID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDgxLmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMDgzID0gZW5mXzEwODIucGVlaygpO1xuICAgIGxldCB0XzEwODQgPSBlbmZfMTA4Mi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodF8xMDg0ID09IG51bGwgfHwgZW5mXzEwODIucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzEwODIuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEwODMsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4cGFuZCh0XzEwODQpO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzEwODUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVbmFyeUV4cHJlc3Npb25cIiwge29wZXJhdG9yOiB0ZXJtXzEwODUub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fMTA4NS5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV8xMDg2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IHRlcm1fMTA4Ni5pc1ByZWZpeCwgb3BlcmF0b3I6IHRlcm1fMTA4Ni5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV8xMDg2Lm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kQmluYXJ5RXhwcmVzc2lvbih0ZXJtXzEwODcpIHtcbiAgICBsZXQgbGVmdF8xMDg4ID0gdGhpcy5leHBhbmQodGVybV8xMDg3LmxlZnQpO1xuICAgIGxldCByaWdodF8xMDg5ID0gdGhpcy5leHBhbmQodGVybV8xMDg3LnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzEwODgsIG9wZXJhdG9yOiB0ZXJtXzEwODcub3BlcmF0b3IsIHJpZ2h0OiByaWdodF8xMDg5fSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fMTA5MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV8xMDkwLnRlc3QpLCBjb25zZXF1ZW50OiB0aGlzLmV4cGFuZCh0ZXJtXzEwOTAuY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV8xMDkwLmFsdGVybmF0ZSl9KTtcbiAgfVxuICBleHBhbmROZXdUYXJnZXRFeHByZXNzaW9uKHRlcm1fMTA5MSkge1xuICAgIHJldHVybiB0ZXJtXzEwOTE7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzEwOTIpIHtcbiAgICBsZXQgY2FsbGVlXzEwOTMgPSB0aGlzLmV4cGFuZCh0ZXJtXzEwOTIuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzEwOTQgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzEwOTIuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfMTA5NSA9IGVuZl8xMDk0LmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ18xMDk2ID0+IHRoaXMuZXhwYW5kKGFyZ18xMDk2KSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTA5MywgYXJndW1lbnRzOiBhcmdzXzEwOTUudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3VwZXIodGVybV8xMDk3KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA5NztcbiAgfVxuICBleHBhbmRDYWxsRXhwcmVzc2lvbih0ZXJtXzEwOTgpIHtcbiAgICBsZXQgY2FsbGVlXzEwOTkgPSB0aGlzLmV4cGFuZCh0ZXJtXzEwOTguY2FsbGVlKTtcbiAgICBsZXQgZW5mXzExMDAgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzEwOTguYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfMTEwMSA9IGVuZl8xMTAwLmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ18xMTAyID0+IHRoaXMuZXhwYW5kKGFyZ18xMTAyKSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwOTksIGFyZ3VtZW50czogYXJnc18xMTAxfSk7XG4gIH1cbiAgZXhwYW5kU3ByZWFkRWxlbWVudCh0ZXJtXzExMDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzExMDMuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFeHByZXNzaW9uU3RhdGVtZW50KHRlcm1fMTEwNCkge1xuICAgIGxldCBjaGlsZF8xMTA1ID0gdGhpcy5leHBhbmQodGVybV8xMTA0LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGNoaWxkXzExMDV9KTtcbiAgfVxuICBleHBhbmRMYWJlbGVkU3RhdGVtZW50KHRlcm1fMTEwNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxhYmVsZWRTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzExMDYubGFiZWwudmFsKCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTEwNi5ib2R5KX0pO1xuICB9XG4gIGRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTA3LCB0eXBlXzExMDgpIHtcbiAgICBsZXQgc2NvcGVfMTEwOSA9IGZyZXNoU2NvcGUoXCJmdW5cIik7XG4gICAgbGV0IHJlZF8xMTEwID0gbmV3IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIoc2NvcGVfMTEwOSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcGFyYW1zXzExMTE7XG4gICAgaWYgKHR5cGVfMTEwOCAhPT0gXCJHZXR0ZXJcIiAmJiB0eXBlXzExMDggIT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHBhcmFtc18xMTExID0gcmVkXzExMTAudHJhbnNmb3JtKHRlcm1fMTEwNy5wYXJhbXMpO1xuICAgICAgcGFyYW1zXzExMTEgPSB0aGlzLmV4cGFuZChwYXJhbXNfMTExMSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucHVzaChzY29wZV8xMTA5KTtcbiAgICBsZXQgY29tcGlsZXJfMTExMiA9IG5ldyBDb21waWxlcih0aGlzLmNvbnRleHQucGhhc2UsIHRoaXMuY29udGV4dC5lbnYsIHRoaXMuY29udGV4dC5zdG9yZSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbWFya2VkQm9keV8xMTEzLCBib2R5VGVybV8xMTE0O1xuICAgIGlmICh0ZXJtXzExMDcuYm9keSBpbnN0YW5jZW9mIFRlcm0pIHtcbiAgICAgIGJvZHlUZXJtXzExMTQgPSB0aGlzLmV4cGFuZCh0ZXJtXzExMDcuYm9keS5hZGRTY29wZShzY29wZV8xMTA5LCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya2VkQm9keV8xMTEzID0gdGVybV8xMTA3LmJvZHkubWFwKGJfMTExNSA9PiBiXzExMTUuYWRkU2NvcGUoc2NvcGVfMTEwOSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgICBib2R5VGVybV8xMTE0ID0gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgc3RhdGVtZW50czogY29tcGlsZXJfMTExMi5jb21waWxlKG1hcmtlZEJvZHlfMTExMyl9KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wb3AoKTtcbiAgICBpZiAodHlwZV8xMTA4ID09PSBcIkdldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMTA4LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMTA3Lm5hbWUpLCBib2R5OiBib2R5VGVybV8xMTE0fSk7XG4gICAgfSBlbHNlIGlmICh0eXBlXzExMDggPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzExMDgsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzExMDcubmFtZSksIHBhcmFtOiB0ZXJtXzExMDcucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzExMTR9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTEwOCwge25hbWU6IHRlcm1fMTEwNy5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV8xMTA3LmlzR2VuZXJhdG9yLCBwYXJhbXM6IHBhcmFtc18xMTExLCBib2R5OiBib2R5VGVybV8xMTE0fSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fMTExNikge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMTE2LCBcIk1ldGhvZFwiKTtcbiAgfVxuICBleHBhbmRTZXR0ZXIodGVybV8xMTE3KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzExMTcsIFwiU2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEdldHRlcih0ZXJtXzExMTgpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTExOCwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzExMTkpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTExOSwgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRXhwcmVzc2lvbih0ZXJtXzExMjApIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTEyMCwgXCJGdW5jdGlvbkV4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzExMjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzExMjEuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzExMjEub3BlcmF0b3IsIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTEyMS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fMTEyMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzExMjIuYmluZGluZyksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTEyMi5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEVtcHR5U3RhdGVtZW50KHRlcm1fMTEyMykge1xuICAgIHJldHVybiB0ZXJtXzExMjM7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uKHRlcm1fMTEyNCkge1xuICAgIHJldHVybiB0ZXJtXzExMjQ7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fMTEyNSkge1xuICAgIHJldHVybiB0ZXJtXzExMjU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbih0ZXJtXzExMjYpIHtcbiAgICByZXR1cm4gdGVybV8xMTI2O1xuICB9XG4gIGV4cGFuZElkZW50aWZpZXJFeHByZXNzaW9uKHRlcm1fMTEyNykge1xuICAgIGxldCB0cmFuc18xMTI4ID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8xMTI3Lm5hbWUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKTtcbiAgICBpZiAodHJhbnNfMTEyOCkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRyYW5zXzExMjguaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fMTEyNztcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVsbEV4cHJlc3Npb24odGVybV8xMTI5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTEyOTtcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzExMzApIHtcbiAgICByZXR1cm4gdGVybV8xMTMwO1xuICB9XG4gIGV4cGFuZExpdGVyYWxSZWdFeHBFeHByZXNzaW9uKHRlcm1fMTEzMSkge1xuICAgIHJldHVybiB0ZXJtXzExMzE7XG4gIH1cbn1cbiJdfQ==