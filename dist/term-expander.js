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
  constructor(context_946) {
    super("expand", true);
    this.context = context_946;
  }
  expand(term_947) {
    return this.dispatch(term_947);
  }
  expandPragma(term_948) {
    return term_948;
  }
  expandTemplateExpression(term_949) {
    return new _terms2.default("TemplateExpression", { tag: term_949.tag == null ? null : this.expand(term_949.tag), elements: term_949.elements.toArray() });
  }
  expandBreakStatement(term_950) {
    return new _terms2.default("BreakStatement", { label: term_950.label ? term_950.label.val() : null });
  }
  expandDoWhileStatement(term_951) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_951.body), test: this.expand(term_951.test) });
  }
  expandWithStatement(term_952) {
    return new _terms2.default("WithStatement", { body: this.expand(term_952.body), object: this.expand(term_952.object) });
  }
  expandDebuggerStatement(term_953) {
    return term_953;
  }
  expandContinueStatement(term_954) {
    return new _terms2.default("ContinueStatement", { label: term_954.label ? term_954.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_955) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_955.discriminant), preDefaultCases: term_955.preDefaultCases.map(c_956 => this.expand(c_956)).toArray(), defaultCase: this.expand(term_955.defaultCase), postDefaultCases: term_955.postDefaultCases.map(c_957 => this.expand(c_957)).toArray() });
  }
  expandComputedMemberExpression(term_958) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_958.object), expression: this.expand(term_958.expression) });
  }
  expandSwitchStatement(term_959) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_959.discriminant), cases: term_959.cases.map(c_960 => this.expand(c_960)).toArray() });
  }
  expandFormalParameters(term_961) {
    let rest_962 = term_961.rest == null ? null : this.expand(term_961.rest);
    return new _terms2.default("FormalParameters", { items: term_961.items.map(i_963 => this.expand(i_963)), rest: rest_962 });
  }
  expandArrowExpression(term_964) {
    return this.doFunctionExpansion(term_964, "ArrowExpression");
  }
  expandSwitchDefault(term_965) {
    return new _terms2.default("SwitchDefault", { consequent: term_965.consequent.map(c_966 => this.expand(c_966)).toArray() });
  }
  expandSwitchCase(term_967) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_967.test), consequent: term_967.consequent.map(c_968 => this.expand(c_968)).toArray() });
  }
  expandForInStatement(term_969) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_969.left), right: this.expand(term_969.right), body: this.expand(term_969.body) });
  }
  expandTryCatchStatement(term_970) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_970.body), catchClause: this.expand(term_970.catchClause) });
  }
  expandTryFinallyStatement(term_971) {
    let catchClause_972 = term_971.catchClause == null ? null : this.expand(term_971.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_971.body), catchClause: catchClause_972, finalizer: this.expand(term_971.finalizer) });
  }
  expandCatchClause(term_973) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_973.binding), body: this.expand(term_973.body) });
  }
  expandThrowStatement(term_974) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_974.expression) });
  }
  expandForOfStatement(term_975) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_975.left), right: this.expand(term_975.right), body: this.expand(term_975.body) });
  }
  expandBindingIdentifier(term_976) {
    return term_976;
  }
  expandBindingPropertyIdentifier(term_977) {
    return term_977;
  }
  expandBindingPropertyProperty(term_978) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_978.name), binding: this.expand(term_978.binding) });
  }
  expandComputedPropertyName(term_979) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_979.expression) });
  }
  expandObjectBinding(term_980) {
    return new _terms2.default("ObjectBinding", { properties: term_980.properties.map(t_981 => this.expand(t_981)).toArray() });
  }
  expandArrayBinding(term_982) {
    let restElement_983 = term_982.restElement == null ? null : this.expand(term_982.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_982.elements.map(t_984 => t_984 == null ? null : this.expand(t_984)).toArray(), restElement: restElement_983 });
  }
  expandBindingWithDefault(term_985) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_985.binding), init: this.expand(term_985.init) });
  }
  expandShorthandProperty(term_986) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_986.name }), expression: new _terms2.default("IdentifierExpression", { name: term_986.name }) });
  }
  expandForStatement(term_987) {
    let init_988 = term_987.init == null ? null : this.expand(term_987.init);
    let test_989 = term_987.test == null ? null : this.expand(term_987.test);
    let update_990 = term_987.update == null ? null : this.expand(term_987.update);
    let body_991 = this.expand(term_987.body);
    return new _terms2.default("ForStatement", { init: init_988, test: test_989, update: update_990, body: body_991 });
  }
  expandYieldExpression(term_992) {
    let expr_993 = term_992.expression == null ? null : this.expand(term_992.expression);
    return new _terms2.default("YieldExpression", { expression: expr_993 });
  }
  expandYieldGeneratorExpression(term_994) {
    let expr_995 = term_994.expression == null ? null : this.expand(term_994.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_995 });
  }
  expandWhileStatement(term_996) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_996.test), body: this.expand(term_996.body) });
  }
  expandIfStatement(term_997) {
    let consequent_998 = term_997.consequent == null ? null : this.expand(term_997.consequent);
    let alternate_999 = term_997.alternate == null ? null : this.expand(term_997.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_997.test), consequent: consequent_998, alternate: alternate_999 });
  }
  expandBlockStatement(term_1000) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_1000.block) });
  }
  expandBlock(term_1001) {
    return new _terms2.default("Block", { statements: term_1001.statements.map(s_1002 => this.expand(s_1002)).toArray() });
  }
  expandVariableDeclarationStatement(term_1003) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_1003.declaration) });
  }
  expandReturnStatement(term_1004) {
    if (term_1004.expression == null) {
      return term_1004;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_1004.expression) });
  }
  expandClassDeclaration(term_1005) {
    return new _terms2.default("ClassDeclaration", { name: term_1005.name == null ? null : this.expand(term_1005.name), super: term_1005.super == null ? null : this.expand(term_1005.super), elements: term_1005.elements.map(el_1006 => this.expand(el_1006)).toArray() });
  }
  expandClassExpression(term_1007) {
    return new _terms2.default("ClassExpression", { name: term_1007.name == null ? null : this.expand(term_1007.name), super: term_1007.super == null ? null : this.expand(term_1007.super), elements: term_1007.elements.map(el_1008 => this.expand(el_1008)).toArray() });
  }
  expandClassElement(term_1009) {
    return new _terms2.default("ClassElement", { isStatic: term_1009.isStatic, method: this.expand(term_1009.method) });
  }
  expandThisExpression(term_1010) {
    return term_1010;
  }
  expandSyntaxTemplate(term_1011) {
    let r_1012 = (0, _templateProcessor.processTemplate)(term_1011.template.inner());
    let str_1013 = _syntax2.default.from("string", _serializer.serializer.write(r_1012.template));
    let callee_1014 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1015 = r_1012.interp.map(i_1017 => {
      let enf_1018 = new _enforester.Enforester(i_1017, (0, _immutable.List)(), this.context);
      return this.expand(enf_1018.enforest("expression"));
    });
    let args_1016 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1013 })).concat(expandedInterps_1015);
    return new _terms2.default("CallExpression", { callee: callee_1014, arguments: args_1016 });
  }
  expandSyntaxQuote(term_1019) {
    let str_1020 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1019.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1019.template.tag, elements: term_1019.template.elements.push(str_1020).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1021) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1021.object), property: term_1021.property });
  }
  expandArrayExpression(term_1022) {
    return new _terms2.default("ArrayExpression", { elements: term_1022.elements.map(t_1023 => t_1023 == null ? t_1023 : this.expand(t_1023)) });
  }
  expandImport(term_1024) {
    return term_1024;
  }
  expandImportNamespace(term_1025) {
    return term_1025;
  }
  expandExport(term_1026) {
    return new _terms2.default("Export", { declaration: this.expand(term_1026.declaration) });
  }
  expandExportDefault(term_1027) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1027.body) });
  }
  expandExportFrom(term_1028) {
    return term_1028;
  }
  expandExportAllFrom(term_1029) {
    return term_1029;
  }
  expandExportSpecifier(term_1030) {
    return term_1030;
  }
  expandStaticPropertyName(term_1031) {
    return term_1031;
  }
  expandDataProperty(term_1032) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1032.name), expression: this.expand(term_1032.expression) });
  }
  expandObjectExpression(term_1033) {
    return new _terms2.default("ObjectExpression", { properties: term_1033.properties.map(t_1034 => this.expand(t_1034)) });
  }
  expandVariableDeclarator(term_1035) {
    let init_1036 = term_1035.init == null ? null : this.expand(term_1035.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1035.binding), init: init_1036 });
  }
  expandVariableDeclaration(term_1037) {
    if (term_1037.kind === "syntax" || term_1037.kind === "syntaxrec") {
      return term_1037;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1037.kind, declarators: term_1037.declarators.map(d_1038 => this.expand(d_1038)) });
  }
  expandParenthesizedExpression(term_1039) {
    if (term_1039.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1040 = new _enforester.Enforester(term_1039.inner, (0, _immutable.List)(), this.context);
    let lookahead_1041 = enf_1040.peek();
    let t_1042 = enf_1040.enforestExpression();
    if (t_1042 == null || enf_1040.rest.size > 0) {
      throw enf_1040.createError(lookahead_1041, "unexpected syntax");
    }
    return this.expand(t_1042);
  }
  expandUnaryExpression(term_1043) {
    return new _terms2.default("UnaryExpression", { operator: term_1043.operator, operand: this.expand(term_1043.operand) });
  }
  expandUpdateExpression(term_1044) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1044.isPrefix, operator: term_1044.operator, operand: this.expand(term_1044.operand) });
  }
  expandBinaryExpression(term_1045) {
    let left_1046 = this.expand(term_1045.left);
    let right_1047 = this.expand(term_1045.right);
    return new _terms2.default("BinaryExpression", { left: left_1046, operator: term_1045.operator, right: right_1047 });
  }
  expandConditionalExpression(term_1048) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1048.test), consequent: this.expand(term_1048.consequent), alternate: this.expand(term_1048.alternate) });
  }
  expandNewTargetExpression(term_1049) {
    return term_1049;
  }
  expandNewExpression(term_1050) {
    let callee_1051 = this.expand(term_1050.callee);
    let enf_1052 = new _enforester.Enforester(term_1050.arguments, (0, _immutable.List)(), this.context);
    let args_1053 = enf_1052.enforestArgumentList().map(arg_1054 => this.expand(arg_1054));
    return new _terms2.default("NewExpression", { callee: callee_1051, arguments: args_1053.toArray() });
  }
  expandSuper(term_1055) {
    return term_1055;
  }
  expandCallExpression(term_1056) {
    let callee_1057 = this.expand(term_1056.callee);
    let enf_1058 = new _enforester.Enforester(term_1056.arguments, (0, _immutable.List)(), this.context);
    let args_1059 = enf_1058.enforestArgumentList().map(arg_1060 => this.expand(arg_1060));
    return new _terms2.default("CallExpression", { callee: callee_1057, arguments: args_1059 });
  }
  expandSpreadElement(term_1061) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1061.expression) });
  }
  expandExpressionStatement(term_1062) {
    let child_1063 = this.expand(term_1062.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1063 });
  }
  expandLabeledStatement(term_1064) {
    return new _terms2.default("LabeledStatement", { label: term_1064.label.val(), body: this.expand(term_1064.body) });
  }
  doFunctionExpansion(term_1065, type_1066) {
    let scope_1067 = (0, _scope.freshScope)("fun");
    let red_1068 = new _applyScopeInParamsReducer2.default(scope_1067, this.context);
    let params_1069;
    if (type_1066 !== "Getter" && type_1066 !== "Setter") {
      params_1069 = red_1068.transform(term_1065.params);
      params_1069 = this.expand(params_1069);
    }
    this.context.currentScope.push(scope_1067);
    let compiler_1070 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1071, bodyTerm_1072;
    if (term_1065.body instanceof _terms2.default) {
      bodyTerm_1072 = this.expand(term_1065.body.addScope(scope_1067, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1071 = term_1065.body.map(b_1073 => b_1073.addScope(scope_1067, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1072 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1070.compile(markedBody_1071) });
    }
    this.context.currentScope.pop();
    if (type_1066 === "Getter") {
      return new _terms2.default(type_1066, { name: this.expand(term_1065.name), body: bodyTerm_1072 });
    } else if (type_1066 === "Setter") {
      return new _terms2.default(type_1066, { name: this.expand(term_1065.name), param: term_1065.param, body: bodyTerm_1072 });
    }
    return new _terms2.default(type_1066, { name: term_1065.name, isGenerator: term_1065.isGenerator, params: params_1069, body: bodyTerm_1072 });
  }
  expandMethod(term_1074) {
    return this.doFunctionExpansion(term_1074, "Method");
  }
  expandSetter(term_1075) {
    return this.doFunctionExpansion(term_1075, "Setter");
  }
  expandGetter(term_1076) {
    return this.doFunctionExpansion(term_1076, "Getter");
  }
  expandFunctionDeclaration(term_1077) {
    return this.doFunctionExpansion(term_1077, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1078) {
    return this.doFunctionExpansion(term_1078, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1079) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1079.binding), operator: term_1079.operator, expression: this.expand(term_1079.expression) });
  }
  expandAssignmentExpression(term_1080) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1080.binding), expression: this.expand(term_1080.expression) });
  }
  expandEmptyStatement(term_1081) {
    return term_1081;
  }
  expandLiteralBooleanExpression(term_1082) {
    return term_1082;
  }
  expandLiteralNumericExpression(term_1083) {
    return term_1083;
  }
  expandLiteralInfinityExpression(term_1084) {
    return term_1084;
  }
  expandIdentifierExpression(term_1085) {
    let trans_1086 = this.context.env.get(term_1085.name.resolve(this.context.phase));
    if (trans_1086) {
      return new _terms2.default("IdentifierExpression", { name: trans_1086.id });
    }
    return term_1085;
  }
  expandLiteralNullExpression(term_1087) {
    return term_1087;
  }
  expandLiteralStringExpression(term_1088) {
    return term_1088;
  }
  expandLiteralRegExpExpression(term_1089) {
    return term_1089;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUFQLEVBQW1DLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUF6QyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsUUFBcEIsRUFBOEI7QUFDNUIsV0FBTyxvQkFBUyxlQUFULEVBQTBC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UyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQTdVcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85NDYpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0Xzk0NjtcbiAgfVxuICBleHBhbmQodGVybV85NDcpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaCh0ZXJtXzk0Nyk7XG4gIH1cbiAgZXhwYW5kUHJhZ21hKHRlcm1fOTQ4KSB7XG4gICAgcmV0dXJuIHRlcm1fOTQ4O1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzk0OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzk0OS50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk0OS50YWcpLCBlbGVtZW50czogdGVybV85NDkuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV85NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTUwLmxhYmVsID8gdGVybV85NTAubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzk1MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTUxLmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk1MS50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV85NTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk1Mi5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk1Mi5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV85NTMpIHtcbiAgICByZXR1cm4gdGVybV85NTM7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV85NTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTU0LmxhYmVsID8gdGVybV85NTQubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV85NTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzk1NS5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fOTU1LnByZURlZmF1bHRDYXNlcy5tYXAoY185NTYgPT4gdGhpcy5leHBhbmQoY185NTYpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk1NS5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fOTU1LnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfOTU3ID0+IHRoaXMuZXhwYW5kKGNfOTU3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fOTU4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fOTU4Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTU4LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fOTU5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTU5LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzk1OS5jYXNlcy5tYXAoY185NjAgPT4gdGhpcy5leHBhbmQoY185NjApKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fOTYxKSB7XG4gICAgbGV0IHJlc3RfOTYyID0gdGVybV85NjEucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTYxLnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzk2MS5pdGVtcy5tYXAoaV85NjMgPT4gdGhpcy5leHBhbmQoaV85NjMpKSwgcmVzdDogcmVzdF85NjJ9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV85NjQpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fOTY0LCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fOTY1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV85NjUuY29uc2VxdWVudC5tYXAoY185NjYgPT4gdGhpcy5leHBhbmQoY185NjYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fOTY3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85NjcudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fOTY3LmNvbnNlcXVlbnQubWFwKGNfOTY4ID0+IHRoaXMuZXhwYW5kKGNfOTY4KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV85NjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV85NjkubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzk2OS5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTY5LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV85NzApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV85NzAuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk3MC5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fOTcxKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzk3MiA9IHRlcm1fOTcxLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85NzEuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTcxLmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfOTcyLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fOTcxLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzk3Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzk3My5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV85NzMuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzk3NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzk3NC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fOTc1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTc1LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV85NzUucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk3NS5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fOTc2KSB7XG4gICAgcmV0dXJuIHRlcm1fOTc2O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV85NzcpIHtcbiAgICByZXR1cm4gdGVybV85Nzc7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV85NzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV85NzgubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTc4LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV85NzkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV85NzkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fOTgwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV85ODAucHJvcGVydGllcy5tYXAodF85ODEgPT4gdGhpcy5leHBhbmQodF85ODEpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV85ODIpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfOTgzID0gdGVybV85ODIucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4Mi5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV85ODIuZWxlbWVudHMubWFwKHRfOTg0ID0+IHRfOTg0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF85ODQpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF85ODN9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV85ODUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTg1LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzk4NS5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fOTg2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fOTg2Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV85ODYubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fOTg3KSB7XG4gICAgbGV0IGluaXRfOTg4ID0gdGVybV85ODcuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTg3LmluaXQpO1xuICAgIGxldCB0ZXN0Xzk4OSA9IHRlcm1fOTg3LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4Ny50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzk5MCA9IHRlcm1fOTg3LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTg3LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfOTkxID0gdGhpcy5leHBhbmQodGVybV85ODcuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzk4OCwgdGVzdDogdGVzdF85ODksIHVwZGF0ZTogdXBkYXRlXzk5MCwgYm9keTogYm9keV85OTF9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV85OTIpIHtcbiAgICBsZXQgZXhwcl85OTMgPSB0ZXJtXzk5Mi5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTIuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzk5M30pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzk5NCkge1xuICAgIGxldCBleHByXzk5NSA9IHRlcm1fOTk0LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5NC5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfOTk1fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV85OTYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85OTYudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTk2LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV85OTcpIHtcbiAgICBsZXQgY29uc2VxdWVudF85OTggPSB0ZXJtXzk5Ny5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTcuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV85OTkgPSB0ZXJtXzk5Ny5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5Ny5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk5Ny50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF85OTgsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk5OX0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fMTAwMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5leHBhbmQodGVybV8xMDAwLmJsb2NrKX0pO1xuICB9XG4gIGV4cGFuZEJsb2NrKHRlcm1fMTAwMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzEwMDEuc3RhdGVtZW50cy5tYXAoc18xMDAyID0+IHRoaXMuZXhwYW5kKHNfMTAwMikpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV8xMDAzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fMTAwMy5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRSZXR1cm5TdGF0ZW1lbnQodGVybV8xMDA0KSB7XG4gICAgaWYgKHRlcm1fMTAwNC5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXJtXzEwMDQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDA0LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzEwMDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0RlY2xhcmF0aW9uXCIsIHtuYW1lOiB0ZXJtXzEwMDUubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAwNS5uYW1lKSwgc3VwZXI6IHRlcm1fMTAwNS5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAwNS5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzEwMDUuZWxlbWVudHMubWFwKGVsXzEwMDYgPT4gdGhpcy5leHBhbmQoZWxfMTAwNikpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRXhwcmVzc2lvbih0ZXJtXzEwMDcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fMTAwNy5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDA3Lm5hbWUpLCBzdXBlcjogdGVybV8xMDA3LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDA3LnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fMTAwNy5lbGVtZW50cy5tYXAoZWxfMTAwOCA9PiB0aGlzLmV4cGFuZChlbF8xMDA4KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFbGVtZW50KHRlcm1fMTAwOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRWxlbWVudFwiLCB7aXNTdGF0aWM6IHRlcm1fMTAwOS5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDkubWV0aG9kKX0pO1xuICB9XG4gIGV4cGFuZFRoaXNFeHByZXNzaW9uKHRlcm1fMTAxMCkge1xuICAgIHJldHVybiB0ZXJtXzEwMTA7XG4gIH1cbiAgZXhwYW5kU3ludGF4VGVtcGxhdGUodGVybV8xMDExKSB7XG4gICAgbGV0IHJfMTAxMiA9IHByb2Nlc3NUZW1wbGF0ZSh0ZXJtXzEwMTEudGVtcGxhdGUuaW5uZXIoKSk7XG4gICAgbGV0IHN0cl8xMDEzID0gU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgc2VyaWFsaXplci53cml0ZShyXzEwMTIudGVtcGxhdGUpKTtcbiAgICBsZXQgY2FsbGVlXzEwMTQgPSBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBTeW50YXguZnJvbShcImlkZW50aWZpZXJcIiwgXCJzeW50YXhUZW1wbGF0ZVwiKX0pO1xuICAgIGxldCBleHBhbmRlZEludGVycHNfMTAxNSA9IHJfMTAxMi5pbnRlcnAubWFwKGlfMTAxNyA9PiB7XG4gICAgICBsZXQgZW5mXzEwMTggPSBuZXcgRW5mb3Jlc3RlcihpXzEwMTcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZChlbmZfMTAxOC5lbmZvcmVzdChcImV4cHJlc3Npb25cIikpO1xuICAgIH0pO1xuICAgIGxldCBhcmdzXzEwMTYgPSBMaXN0Lm9mKG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBzdHJfMTAxM30pKS5jb25jYXQoZXhwYW5kZWRJbnRlcnBzXzEwMTUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDE0LCBhcmd1bWVudHM6IGFyZ3NfMTAxNn0pO1xuICB9XG4gIGV4cGFuZFN5bnRheFF1b3RlKHRlcm1fMTAxOSkge1xuICAgIGxldCBzdHJfMTAyMCA9IG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHRlcm1fMTAxOS5uYW1lKSl9KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV8xMDE5LnRlbXBsYXRlLnRhZywgZWxlbWVudHM6IHRlcm1fMTAxOS50ZW1wbGF0ZS5lbGVtZW50cy5wdXNoKHN0cl8xMDIwKS5wdXNoKG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogXCJcIn0pKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdGF0aWNNZW1iZXJFeHByZXNzaW9uKHRlcm1fMTAyMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV8xMDIxLm9iamVjdCksIHByb3BlcnR5OiB0ZXJtXzEwMjEucHJvcGVydHl9KTtcbiAgfVxuICBleHBhbmRBcnJheUV4cHJlc3Npb24odGVybV8xMDIyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogdGVybV8xMDIyLmVsZW1lbnRzLm1hcCh0XzEwMjMgPT4gdF8xMDIzID09IG51bGwgPyB0XzEwMjMgOiB0aGlzLmV4cGFuZCh0XzEwMjMpKX0pO1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzEwMjQpIHtcbiAgICByZXR1cm4gdGVybV8xMDI0O1xuICB9XG4gIGV4cGFuZEltcG9ydE5hbWVzcGFjZSh0ZXJtXzEwMjUpIHtcbiAgICByZXR1cm4gdGVybV8xMDI1O1xuICB9XG4gIGV4cGFuZEV4cG9ydCh0ZXJtXzEwMjYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjYuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RGVmYXVsdCh0ZXJtXzEwMjcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMjcuYm9keSl9KTtcbiAgfVxuICBleHBhbmRFeHBvcnRGcm9tKHRlcm1fMTAyOCkge1xuICAgIHJldHVybiB0ZXJtXzEwMjg7XG4gIH1cbiAgZXhwYW5kRXhwb3J0QWxsRnJvbSh0ZXJtXzEwMjkpIHtcbiAgICByZXR1cm4gdGVybV8xMDI5O1xuICB9XG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtXzEwMzApIHtcbiAgICByZXR1cm4gdGVybV8xMDMwO1xuICB9XG4gIGV4cGFuZFN0YXRpY1Byb3BlcnR5TmFtZSh0ZXJtXzEwMzEpIHtcbiAgICByZXR1cm4gdGVybV8xMDMxO1xuICB9XG4gIGV4cGFuZERhdGFQcm9wZXJ0eSh0ZXJtXzEwMzIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTAzMi5uYW1lKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDMyLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0RXhwcmVzc2lvbih0ZXJtXzEwMzMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzEwMzMucHJvcGVydGllcy5tYXAodF8xMDM0ID0+IHRoaXMuZXhwYW5kKHRfMTAzNCkpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdG9yKHRlcm1fMTAzNSkge1xuICAgIGxldCBpbml0XzEwMzYgPSB0ZXJtXzEwMzUuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNS5pbml0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTAzNS5iaW5kaW5nKSwgaW5pdDogaW5pdF8xMDM2fSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtXzEwMzcpIHtcbiAgICBpZiAodGVybV8xMDM3LmtpbmQgPT09IFwic3ludGF4XCIgfHwgdGVybV8xMDM3LmtpbmQgPT09IFwic3ludGF4cmVjXCIpIHtcbiAgICAgIHJldHVybiB0ZXJtXzEwMzc7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHRlcm1fMTAzNy5raW5kLCBkZWNsYXJhdG9yczogdGVybV8xMDM3LmRlY2xhcmF0b3JzLm1hcChkXzEwMzggPT4gdGhpcy5leHBhbmQoZF8xMDM4KSl9KTtcbiAgfVxuICBleHBhbmRQYXJlbnRoZXNpemVkRXhwcmVzc2lvbih0ZXJtXzEwMzkpIHtcbiAgICBpZiAodGVybV8xMDM5LmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzEwNDAgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzEwMzkuaW5uZXIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzEwNDEgPSBlbmZfMTA0MC5wZWVrKCk7XG4gICAgbGV0IHRfMTA0MiA9IGVuZl8xMDQwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzEwNDIgPT0gbnVsbCB8fCBlbmZfMTA0MC5yZXN0LnNpemUgPiAwKSB7XG4gICAgICB0aHJvdyBlbmZfMTA0MC5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTA0MSwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kKHRfMTA0Mik7XG4gIH1cbiAgZXhwYW5kVW5hcnlFeHByZXNzaW9uKHRlcm1fMTA0Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fMTA0My5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV8xMDQzLm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kVXBkYXRlRXhwcmVzc2lvbih0ZXJtXzEwNDQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV8xMDQ0LmlzUHJlZml4LCBvcGVyYXRvcjogdGVybV8xMDQ0Lm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDQub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fMTA0NSkge1xuICAgIGxldCBsZWZ0XzEwNDYgPSB0aGlzLmV4cGFuZCh0ZXJtXzEwNDUubGVmdCk7XG4gICAgbGV0IHJpZ2h0XzEwNDcgPSB0aGlzLmV4cGFuZCh0ZXJtXzEwNDUucmlnaHQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTA0Niwgb3BlcmF0b3I6IHRlcm1fMTA0NS5vcGVyYXRvciwgcmlnaHQ6IHJpZ2h0XzEwNDd9KTtcbiAgfVxuICBleHBhbmRDb25kaXRpb25hbEV4cHJlc3Npb24odGVybV8xMDQ4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDgudGVzdCksIGNvbnNlcXVlbnQ6IHRoaXMuZXhwYW5kKHRlcm1fMTA0OC5jb25zZXF1ZW50KSwgYWx0ZXJuYXRlOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDguYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV8xMDQ5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA0OTtcbiAgfVxuICBleHBhbmROZXdFeHByZXNzaW9uKHRlcm1fMTA1MCkge1xuICAgIGxldCBjYWxsZWVfMTA1MSA9IHRoaXMuZXhwYW5kKHRlcm1fMTA1MC5jYWxsZWUpO1xuICAgIGxldCBlbmZfMTA1MiA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTA1MC5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc18xMDUzID0gZW5mXzEwNTIuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzEwNTQgPT4gdGhpcy5leHBhbmQoYXJnXzEwNTQpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDUxLCBhcmd1bWVudHM6IGFyZ3NfMTA1My50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdXBlcih0ZXJtXzEwNTUpIHtcbiAgICByZXR1cm4gdGVybV8xMDU1O1xuICB9XG4gIGV4cGFuZENhbGxFeHByZXNzaW9uKHRlcm1fMTA1Nikge1xuICAgIGxldCBjYWxsZWVfMTA1NyA9IHRoaXMuZXhwYW5kKHRlcm1fMTA1Ni5jYWxsZWUpO1xuICAgIGxldCBlbmZfMTA1OCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTA1Ni5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc18xMDU5ID0gZW5mXzEwNTguZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzEwNjAgPT4gdGhpcy5leHBhbmQoYXJnXzEwNjApKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTA1NywgYXJndW1lbnRzOiBhcmdzXzEwNTl9KTtcbiAgfVxuICBleHBhbmRTcHJlYWRFbGVtZW50KHRlcm1fMTA2MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fMTA2MS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cHJlc3Npb25TdGF0ZW1lbnQodGVybV8xMDYyKSB7XG4gICAgbGV0IGNoaWxkXzEwNjMgPSB0aGlzLmV4cGFuZCh0ZXJtXzEwNjIuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogY2hpbGRfMTA2M30pO1xuICB9XG4gIGV4cGFuZExhYmVsZWRTdGF0ZW1lbnQodGVybV8xMDY0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fMTA2NC5sYWJlbC52YWwoKSwgYm9keTogdGhpcy5leHBhbmQodGVybV8xMDY0LmJvZHkpfSk7XG4gIH1cbiAgZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNjUsIHR5cGVfMTA2Nikge1xuICAgIGxldCBzY29wZV8xMDY3ID0gZnJlc2hTY29wZShcImZ1blwiKTtcbiAgICBsZXQgcmVkXzEwNjggPSBuZXcgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlcihzY29wZV8xMDY3LCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwYXJhbXNfMTA2OTtcbiAgICBpZiAodHlwZV8xMDY2ICE9PSBcIkdldHRlclwiICYmIHR5cGVfMTA2NiAhPT0gXCJTZXR0ZXJcIikge1xuICAgICAgcGFyYW1zXzEwNjkgPSByZWRfMTA2OC50cmFuc2Zvcm0odGVybV8xMDY1LnBhcmFtcyk7XG4gICAgICBwYXJhbXNfMTA2OSA9IHRoaXMuZXhwYW5kKHBhcmFtc18xMDY5KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzEwNjcpO1xuICAgIGxldCBjb21waWxlcl8xMDcwID0gbmV3IENvbXBpbGVyKHRoaXMuY29udGV4dC5waGFzZSwgdGhpcy5jb250ZXh0LmVudiwgdGhpcy5jb250ZXh0LnN0b3JlLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5XzEwNzEsIGJvZHlUZXJtXzEwNzI7XG4gICAgaWYgKHRlcm1fMTA2NS5ib2R5IGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgYm9keVRlcm1fMTA3MiA9IHRoaXMuZXhwYW5kKHRlcm1fMTA2NS5ib2R5LmFkZFNjb3BlKHNjb3BlXzEwNjcsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5XzEwNzEgPSB0ZXJtXzEwNjUuYm9keS5tYXAoYl8xMDczID0+IGJfMTA3My5hZGRTY29wZShzY29wZV8xMDY3LCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICAgIGJvZHlUZXJtXzEwNzIgPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBjb21waWxlcl8xMDcwLmNvbXBpbGUobWFya2VkQm9keV8xMDcxKX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzEwNjYgPT09IFwiR2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNjYsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNjUubmFtZSksIGJvZHk6IGJvZHlUZXJtXzEwNzJ9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVfMTA2NiA9PT0gXCJTZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA2Niwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTA2NS5uYW1lKSwgcGFyYW06IHRlcm1fMTA2NS5wYXJhbSwgYm9keTogYm9keVRlcm1fMTA3Mn0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDY2LCB7bmFtZTogdGVybV8xMDY1Lm5hbWUsIGlzR2VuZXJhdG9yOiB0ZXJtXzEwNjUuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzEwNjksIGJvZHk6IGJvZHlUZXJtXzEwNzJ9KTtcbiAgfVxuICBleHBhbmRNZXRob2QodGVybV8xMDc0KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNzQsIFwiTWV0aG9kXCIpO1xuICB9XG4gIGV4cGFuZFNldHRlcih0ZXJtXzEwNzUpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA3NSwgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fMTA3Nikge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDc2LCBcIkdldHRlclwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkRlY2xhcmF0aW9uKHRlcm1fMTA3Nykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDc3LCBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25FeHByZXNzaW9uKHRlcm1fMTA3OCkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDc4LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fMTA3OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTA3OS5iaW5kaW5nKSwgb3BlcmF0b3I6IHRlcm1fMTA3OS5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDc5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV8xMDgwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fMTA4MC5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDgwLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRW1wdHlTdGF0ZW1lbnQodGVybV8xMDgxKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MTtcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV8xMDgyKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MjtcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24odGVybV8xMDgzKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MztcbiAgfVxuICBleHBhbmRMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uKHRlcm1fMTA4NCkge1xuICAgIHJldHVybiB0ZXJtXzEwODQ7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV8xMDg1KSB7XG4gICAgbGV0IHRyYW5zXzEwODYgPSB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzEwODUubmFtZS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICAgIGlmICh0cmFuc18xMDg2KSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdHJhbnNfMTA4Ni5pZH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVybV8xMDg1O1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzEwODcpIHtcbiAgICByZXR1cm4gdGVybV8xMDg3O1xuICB9XG4gIGV4cGFuZExpdGVyYWxTdHJpbmdFeHByZXNzaW9uKHRlcm1fMTA4OCkge1xuICAgIHJldHVybiB0ZXJtXzEwODg7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24odGVybV8xMDg5KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4OTtcbiAgfVxufVxuIl19