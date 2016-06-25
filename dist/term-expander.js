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
  constructor(context_944) {
    super("expand", true);
    this.context = context_944;
  }
  expand(term_945) {
    return this.dispatch(term_945);
  }
  expandPragma(term_946) {
    return term_946;
  }
  expandTemplateExpression(term_947) {
    return new _terms2.default("TemplateExpression", { tag: term_947.tag == null ? null : this.expand(term_947.tag), elements: term_947.elements.toArray() });
  }
  expandBreakStatement(term_948) {
    return new _terms2.default("BreakStatement", { label: term_948.label ? term_948.label.val() : null });
  }
  expandDoWhileStatement(term_949) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_949.body), test: this.expand(term_949.test) });
  }
  expandWithStatement(term_950) {
    return new _terms2.default("WithStatement", { body: this.expand(term_950.body), object: this.expand(term_950.object) });
  }
  expandDebuggerStatement(term_951) {
    return term_951;
  }
  expandContinueStatement(term_952) {
    return new _terms2.default("ContinueStatement", { label: term_952.label ? term_952.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_953) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_953.discriminant), preDefaultCases: term_953.preDefaultCases.map(c_954 => this.expand(c_954)).toArray(), defaultCase: this.expand(term_953.defaultCase), postDefaultCases: term_953.postDefaultCases.map(c_955 => this.expand(c_955)).toArray() });
  }
  expandComputedMemberExpression(term_956) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_956.object), expression: this.expand(term_956.expression) });
  }
  expandSwitchStatement(term_957) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_957.discriminant), cases: term_957.cases.map(c_958 => this.expand(c_958)).toArray() });
  }
  expandFormalParameters(term_959) {
    let rest_960 = term_959.rest == null ? null : this.expand(term_959.rest);
    return new _terms2.default("FormalParameters", { items: term_959.items.map(i_961 => this.expand(i_961)), rest: rest_960 });
  }
  expandArrowExpression(term_962) {
    return this.doFunctionExpansion(term_962, "ArrowExpression");
  }
  expandSwitchDefault(term_963) {
    return new _terms2.default("SwitchDefault", { consequent: term_963.consequent.map(c_964 => this.expand(c_964)).toArray() });
  }
  expandSwitchCase(term_965) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_965.test), consequent: term_965.consequent.map(c_966 => this.expand(c_966)).toArray() });
  }
  expandForInStatement(term_967) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_967.left), right: this.expand(term_967.right), body: this.expand(term_967.body) });
  }
  expandTryCatchStatement(term_968) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_968.body), catchClause: this.expand(term_968.catchClause) });
  }
  expandTryFinallyStatement(term_969) {
    let catchClause_970 = term_969.catchClause == null ? null : this.expand(term_969.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_969.body), catchClause: catchClause_970, finalizer: this.expand(term_969.finalizer) });
  }
  expandCatchClause(term_971) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_971.binding), body: this.expand(term_971.body) });
  }
  expandThrowStatement(term_972) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_972.expression) });
  }
  expandForOfStatement(term_973) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_973.left), right: this.expand(term_973.right), body: this.expand(term_973.body) });
  }
  expandBindingIdentifier(term_974) {
    return term_974;
  }
  expandBindingPropertyIdentifier(term_975) {
    return term_975;
  }
  expandBindingPropertyProperty(term_976) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_976.name), binding: this.expand(term_976.binding) });
  }
  expandComputedPropertyName(term_977) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_977.expression) });
  }
  expandObjectBinding(term_978) {
    return new _terms2.default("ObjectBinding", { properties: term_978.properties.map(t_979 => this.expand(t_979)).toArray() });
  }
  expandArrayBinding(term_980) {
    let restElement_981 = term_980.restElement == null ? null : this.expand(term_980.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_980.elements.map(t_982 => t_982 == null ? null : this.expand(t_982)).toArray(), restElement: restElement_981 });
  }
  expandBindingWithDefault(term_983) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_983.binding), init: this.expand(term_983.init) });
  }
  expandShorthandProperty(term_984) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_984.name }), expression: new _terms2.default("IdentifierExpression", { name: term_984.name }) });
  }
  expandForStatement(term_985) {
    let init_986 = term_985.init == null ? null : this.expand(term_985.init);
    let test_987 = term_985.test == null ? null : this.expand(term_985.test);
    let update_988 = term_985.update == null ? null : this.expand(term_985.update);
    let body_989 = this.expand(term_985.body);
    return new _terms2.default("ForStatement", { init: init_986, test: test_987, update: update_988, body: body_989 });
  }
  expandYieldExpression(term_990) {
    let expr_991 = term_990.expression == null ? null : this.expand(term_990.expression);
    return new _terms2.default("YieldExpression", { expression: expr_991 });
  }
  expandYieldGeneratorExpression(term_992) {
    let expr_993 = term_992.expression == null ? null : this.expand(term_992.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_993 });
  }
  expandWhileStatement(term_994) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_994.test), body: this.expand(term_994.body) });
  }
  expandIfStatement(term_995) {
    let consequent_996 = term_995.consequent == null ? null : this.expand(term_995.consequent);
    let alternate_997 = term_995.alternate == null ? null : this.expand(term_995.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_995.test), consequent: consequent_996, alternate: alternate_997 });
  }
  expandBlockStatement(term_998) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_998.block) });
  }
  expandBlock(term_999) {
    return new _terms2.default("Block", { statements: term_999.statements.map(s_1000 => this.expand(s_1000)).toArray() });
  }
  expandVariableDeclarationStatement(term_1001) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_1001.declaration) });
  }
  expandReturnStatement(term_1002) {
    if (term_1002.expression == null) {
      return term_1002;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_1002.expression) });
  }
  expandClassDeclaration(term_1003) {
    return new _terms2.default("ClassDeclaration", { name: term_1003.name == null ? null : this.expand(term_1003.name), super: term_1003.super == null ? null : this.expand(term_1003.super), elements: term_1003.elements.map(el_1004 => this.expand(el_1004)).toArray() });
  }
  expandClassExpression(term_1005) {
    return new _terms2.default("ClassExpression", { name: term_1005.name == null ? null : this.expand(term_1005.name), super: term_1005.super == null ? null : this.expand(term_1005.super), elements: term_1005.elements.map(el_1006 => this.expand(el_1006)).toArray() });
  }
  expandClassElement(term_1007) {
    return new _terms2.default("ClassElement", { isStatic: term_1007.isStatic, method: this.expand(term_1007.method) });
  }
  expandThisExpression(term_1008) {
    return term_1008;
  }
  expandSyntaxTemplate(term_1009) {
    let r_1010 = (0, _templateProcessor.processTemplate)(term_1009.template.inner());
    let str_1011 = _syntax2.default.from("string", _serializer.serializer.write(r_1010.template));
    let callee_1012 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_1013 = r_1010.interp.map(i_1015 => {
      let enf_1016 = new _enforester.Enforester(i_1015, (0, _immutable.List)(), this.context);
      return this.expand(enf_1016.enforest("expression"));
    });
    let args_1014 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_1011 })).concat(expandedInterps_1013);
    return new _terms2.default("CallExpression", { callee: callee_1012, arguments: args_1014 });
  }
  expandSyntaxQuote(term_1017) {
    let str_1018 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_1017.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_1017.template.tag, elements: term_1017.template.elements.push(str_1018).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_1019) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_1019.object), property: term_1019.property });
  }
  expandArrayExpression(term_1020) {
    return new _terms2.default("ArrayExpression", { elements: term_1020.elements.map(t_1021 => t_1021 == null ? t_1021 : this.expand(t_1021)) });
  }
  expandImport(term_1022) {
    return term_1022;
  }
  expandImportNamespace(term_1023) {
    return term_1023;
  }
  expandExport(term_1024) {
    return new _terms2.default("Export", { declaration: this.expand(term_1024.declaration) });
  }
  expandExportDefault(term_1025) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_1025.body) });
  }
  expandExportFrom(term_1026) {
    return term_1026;
  }
  expandExportAllFrom(term_1027) {
    return term_1027;
  }
  expandExportSpecifier(term_1028) {
    return term_1028;
  }
  expandStaticPropertyName(term_1029) {
    return term_1029;
  }
  expandDataProperty(term_1030) {
    return new _terms2.default("DataProperty", { name: this.expand(term_1030.name), expression: this.expand(term_1030.expression) });
  }
  expandObjectExpression(term_1031) {
    return new _terms2.default("ObjectExpression", { properties: term_1031.properties.map(t_1032 => this.expand(t_1032)) });
  }
  expandVariableDeclarator(term_1033) {
    let init_1034 = term_1033.init == null ? null : this.expand(term_1033.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_1033.binding), init: init_1034 });
  }
  expandVariableDeclaration(term_1035) {
    if (term_1035.kind === "syntax" || term_1035.kind === "syntaxrec") {
      return term_1035;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1035.kind, declarators: term_1035.declarators.map(d_1036 => this.expand(d_1036)) });
  }
  expandParenthesizedExpression(term_1037) {
    if (term_1037.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1038 = new _enforester.Enforester(term_1037.inner, (0, _immutable.List)(), this.context);
    let lookahead_1039 = enf_1038.peek();
    let t_1040 = enf_1038.enforestExpression();
    if (t_1040 == null || enf_1038.rest.size > 0) {
      throw enf_1038.createError(lookahead_1039, "unexpected syntax");
    }
    return this.expand(t_1040);
  }
  expandUnaryExpression(term_1041) {
    return new _terms2.default("UnaryExpression", { operator: term_1041.operator, operand: this.expand(term_1041.operand) });
  }
  expandUpdateExpression(term_1042) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1042.isPrefix, operator: term_1042.operator, operand: this.expand(term_1042.operand) });
  }
  expandBinaryExpression(term_1043) {
    let left_1044 = this.expand(term_1043.left);
    let right_1045 = this.expand(term_1043.right);
    return new _terms2.default("BinaryExpression", { left: left_1044, operator: term_1043.operator, right: right_1045 });
  }
  expandConditionalExpression(term_1046) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1046.test), consequent: this.expand(term_1046.consequent), alternate: this.expand(term_1046.alternate) });
  }
  expandNewTargetExpression(term_1047) {
    return term_1047;
  }
  expandNewExpression(term_1048) {
    let callee_1049 = this.expand(term_1048.callee);
    let enf_1050 = new _enforester.Enforester(term_1048.arguments, (0, _immutable.List)(), this.context);
    let args_1051 = enf_1050.enforestArgumentList().map(arg_1052 => this.expand(arg_1052));
    return new _terms2.default("NewExpression", { callee: callee_1049, arguments: args_1051.toArray() });
  }
  expandSuper(term_1053) {
    return term_1053;
  }
  expandCallExpression(term_1054) {
    let callee_1055 = this.expand(term_1054.callee);
    let enf_1056 = new _enforester.Enforester(term_1054.arguments, (0, _immutable.List)(), this.context);
    let args_1057 = enf_1056.enforestArgumentList().map(arg_1058 => this.expand(arg_1058));
    return new _terms2.default("CallExpression", { callee: callee_1055, arguments: args_1057 });
  }
  expandSpreadElement(term_1059) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1059.expression) });
  }
  expandExpressionStatement(term_1060) {
    let child_1061 = this.expand(term_1060.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1061 });
  }
  expandLabeledStatement(term_1062) {
    return new _terms2.default("LabeledStatement", { label: term_1062.label.val(), body: this.expand(term_1062.body) });
  }
  doFunctionExpansion(term_1063, type_1064) {
    let scope_1065 = (0, _scope.freshScope)("fun");
    let red_1066 = new _applyScopeInParamsReducer2.default(scope_1065, this.context);
    let params_1067;
    if (type_1064 !== "Getter" && type_1064 !== "Setter") {
      params_1067 = red_1066.transform(term_1063.params);
      params_1067 = this.expand(params_1067);
    }
    this.context.currentScope.push(scope_1065);
    let compiler_1068 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1069, bodyTerm_1070;
    if (term_1063.body instanceof _terms2.default) {
      bodyTerm_1070 = this.expand(term_1063.body.addScope(scope_1065, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1069 = term_1063.body.map(b_1071 => b_1071.addScope(scope_1065, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1070 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1068.compile(markedBody_1069) });
    }
    this.context.currentScope.pop();
    if (type_1064 === "Getter") {
      return new _terms2.default(type_1064, { name: this.expand(term_1063.name), body: bodyTerm_1070 });
    } else if (type_1064 === "Setter") {
      return new _terms2.default(type_1064, { name: this.expand(term_1063.name), param: term_1063.param, body: bodyTerm_1070 });
    }
    return new _terms2.default(type_1064, { name: term_1063.name, isGenerator: term_1063.isGenerator, params: params_1067, body: bodyTerm_1070 });
  }
  expandMethod(term_1072) {
    return this.doFunctionExpansion(term_1072, "Method");
  }
  expandSetter(term_1073) {
    return this.doFunctionExpansion(term_1073, "Setter");
  }
  expandGetter(term_1074) {
    return this.doFunctionExpansion(term_1074, "Getter");
  }
  expandFunctionDeclaration(term_1075) {
    return this.doFunctionExpansion(term_1075, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1076) {
    return this.doFunctionExpansion(term_1076, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1077) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1077.binding), operator: term_1077.operator, expression: this.expand(term_1077.expression) });
  }
  expandAssignmentExpression(term_1078) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1078.binding), expression: this.expand(term_1078.expression) });
  }
  expandEmptyStatement(term_1079) {
    return term_1079;
  }
  expandLiteralBooleanExpression(term_1080) {
    return term_1080;
  }
  expandLiteralNumericExpression(term_1081) {
    return term_1081;
  }
  expandLiteralInfinityExpression(term_1082) {
    return term_1082;
  }
  expandIdentifierExpression(term_1083) {
    let trans_1084 = this.context.env.get(term_1083.name.resolve(this.context.phase));
    if (trans_1084) {
      return new _terms2.default("IdentifierExpression", { name: trans_1084.id });
    }
    return term_1083;
  }
  expandLiteralNullExpression(term_1085) {
    return term_1085;
  }
  expandLiteralStringExpression(term_1086) {
    return term_1086;
  }
  expandLiteralRegExpExpression(term_1087) {
    return term_1087;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFDZSxNQUFNLFlBQU4saUNBQXlDO0FBQ3RELGNBQVksV0FBWixFQUF5QjtBQUN2QixVQUFNLFFBQU4sRUFBZ0IsSUFBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsRUFBaUI7QUFDZixXQUFPLEtBQUssUUFBTCxDQUFjLFFBQWQsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxRQUFiLEVBQXVCO0FBQ3JCLFdBQU8sUUFBUDtBQUNEO0FBQ0QsMkJBQXlCLFFBQXpCLEVBQW1DO0FBQ2pDLFdBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDtBQUNELHVCQUFxQixRQUFyQixFQUErQjtBQUM3QixXQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxTQUFTLEtBQVQsR0FBaUIsU0FBUyxLQUFULENBQWUsR0FBZixFQUFqQixHQUF3QyxJQUFoRCxFQUEzQixDQUFQO0FBQ0Q7QUFDRCx5QkFBdUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUFQLEVBQW1DLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBUyxJQUFyQixDQUF6QyxFQUE3QixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsUUFBcEIsRUFBOEI7QUFDNUIsV0FBTyxvQkFBUyxlQUFULEVBQTBC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UyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sV0FBVyxFQUFsQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLFNBQVA7QUFDRDtBQUNELDhCQUE0QixTQUE1QixFQUF1QztBQUNyQyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQUNELGdDQUE4QixTQUE5QixFQUF5QztBQUN2QyxXQUFPLFNBQVA7QUFDRDtBQTdVcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgQ29tcGlsZXIgZnJvbSBcIi4vY29tcGlsZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmltcG9ydCBBU1REaXNwYXRjaGVyIGZyb20gXCIuL2FzdC1kaXNwYXRjaGVyXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIgZXh0ZW5kcyBBU1REaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85NDQpIHtcbiAgICBzdXBlcihcImV4cGFuZFwiLCB0cnVlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0Xzk0NDtcbiAgfVxuICBleHBhbmQodGVybV85NDUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaCh0ZXJtXzk0NSk7XG4gIH1cbiAgZXhwYW5kUHJhZ21hKHRlcm1fOTQ2KSB7XG4gICAgcmV0dXJuIHRlcm1fOTQ2O1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzk0Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzk0Ny50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk0Ny50YWcpLCBlbGVtZW50czogdGVybV85NDcuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV85NDgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTQ4LmxhYmVsID8gdGVybV85NDgubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzk0OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTQ5LmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk0OS50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV85NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk1MC5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk1MC5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV85NTEpIHtcbiAgICByZXR1cm4gdGVybV85NTE7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV85NTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fOTUyLmxhYmVsID8gdGVybV85NTIubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV85NTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzk1My5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fOTUzLnByZURlZmF1bHRDYXNlcy5tYXAoY185NTQgPT4gdGhpcy5leHBhbmQoY185NTQpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk1My5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fOTUzLnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfOTU1ID0+IHRoaXMuZXhwYW5kKGNfOTU1KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fOTU2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fOTU2Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fOTU2LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fOTU3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTU3LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzk1Ny5jYXNlcy5tYXAoY185NTggPT4gdGhpcy5leHBhbmQoY185NTgpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fOTU5KSB7XG4gICAgbGV0IHJlc3RfOTYwID0gdGVybV85NTkucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTU5LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzk1OS5pdGVtcy5tYXAoaV85NjEgPT4gdGhpcy5leHBhbmQoaV85NjEpKSwgcmVzdDogcmVzdF85NjB9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV85NjIpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fOTYyLCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fOTYzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV85NjMuY29uc2VxdWVudC5tYXAoY185NjQgPT4gdGhpcy5leHBhbmQoY185NjQpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fOTY1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85NjUudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fOTY1LmNvbnNlcXVlbnQubWFwKGNfOTY2ID0+IHRoaXMuZXhwYW5kKGNfOTY2KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV85NjcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV85NjcubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzk2Ny5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTY3LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV85NjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV85NjguYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzk2OC5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fOTY5KSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzk3MCA9IHRlcm1fOTY5LmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85NjkuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTY5LmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfOTcwLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fOTY5LmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzk3MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzk3MS5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV85NzEuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzk3Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzk3Mi5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fOTczKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fOTczLmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV85NzMucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzk3My5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fOTc0KSB7XG4gICAgcmV0dXJuIHRlcm1fOTc0O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV85NzUpIHtcbiAgICByZXR1cm4gdGVybV85NzU7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV85NzYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV85NzYubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTc2LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV85NzcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV85NzcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fOTc4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV85NzgucHJvcGVydGllcy5tYXAodF85NzkgPT4gdGhpcy5leHBhbmQodF85NzkpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV85ODApIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfOTgxID0gdGVybV85ODAucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4MC5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV85ODAuZWxlbWVudHMubWFwKHRfOTgyID0+IHRfOTgyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF85ODIpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF85ODF9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV85ODMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fOTgzLmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzk4My5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fOTg0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fOTg0Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV85ODQubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fOTg1KSB7XG4gICAgbGV0IGluaXRfOTg2ID0gdGVybV85ODUuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTg1LmluaXQpO1xuICAgIGxldCB0ZXN0Xzk4NyA9IHRlcm1fOTg1LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk4NS50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzk4OCA9IHRlcm1fOTg1LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fOTg1LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfOTg5ID0gdGhpcy5leHBhbmQodGVybV85ODUuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzk4NiwgdGVzdDogdGVzdF85ODcsIHVwZGF0ZTogdXBkYXRlXzk4OCwgYm9keTogYm9keV85ODl9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV85OTApIHtcbiAgICBsZXQgZXhwcl85OTEgPSB0ZXJtXzk5MC5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTAuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzk5MX0pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzk5Mikge1xuICAgIGxldCBleHByXzk5MyA9IHRlcm1fOTkyLmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5Mi5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfOTkzfSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV85OTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV85OTQudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fOTk0LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV85OTUpIHtcbiAgICBsZXQgY29uc2VxdWVudF85OTYgPSB0ZXJtXzk5NS5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV85OTUuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV85OTcgPSB0ZXJtXzk5NS5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzk5NS5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzk5NS50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF85OTYsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk5N30pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fOTk4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzk5OC5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzk5OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzk5OS5zdGF0ZW1lbnRzLm1hcChzXzEwMDAgPT4gdGhpcy5leHBhbmQoc18xMDAwKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCh0ZXJtXzEwMDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV8xMDAxLmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZFJldHVyblN0YXRlbWVudCh0ZXJtXzEwMDIpIHtcbiAgICBpZiAodGVybV8xMDAyLmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fMTAwMjtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDIuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRDbGFzc0RlY2xhcmF0aW9uKHRlcm1fMTAwMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fMTAwMy5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDAzLm5hbWUpLCBzdXBlcjogdGVybV8xMDAzLnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDAzLnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fMTAwMy5lbGVtZW50cy5tYXAoZWxfMTAwNCA9PiB0aGlzLmV4cGFuZChlbF8xMDA0KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFeHByZXNzaW9uKHRlcm1fMTAwNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV8xMDA1Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDUubmFtZSksIHN1cGVyOiB0ZXJtXzEwMDUuc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMDUuc3VwZXIpLCBlbGVtZW50czogdGVybV8xMDA1LmVsZW1lbnRzLm1hcChlbF8xMDA2ID0+IHRoaXMuZXhwYW5kKGVsXzEwMDYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV8xMDA3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogdGVybV8xMDA3LmlzU3RhdGljLCBtZXRob2Q6IHRoaXMuZXhwYW5kKHRlcm1fMTAwNy5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV8xMDA4KSB7XG4gICAgcmV0dXJuIHRlcm1fMTAwODtcbiAgfVxuICBleHBhbmRTeW50YXhUZW1wbGF0ZSh0ZXJtXzEwMDkpIHtcbiAgICBsZXQgcl8xMDEwID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fMTAwOS50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzEwMTEgPSBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHJfMTAxMC50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfMTAxMiA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCBcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc18xMDEzID0gcl8xMDEwLmludGVycC5tYXAoaV8xMDE1ID0+IHtcbiAgICAgIGxldCBlbmZfMTAxNiA9IG5ldyBFbmZvcmVzdGVyKGlfMTAxNSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl8xMDE2LmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKSk7XG4gICAgfSk7XG4gICAgbGV0IGFyZ3NfMTAxNCA9IExpc3Qub2YobmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHN0cl8xMDExfSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfMTAxMyk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwMTIsIGFyZ3VtZW50czogYXJnc18xMDE0fSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV8xMDE3KSB7XG4gICAgbGV0IHN0cl8xMDE4ID0gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHNlcmlhbGl6ZXIud3JpdGUodGVybV8xMDE3Lm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzEwMTcudGVtcGxhdGUudGFnLCBlbGVtZW50czogdGVybV8xMDE3LnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyXzEwMTgpLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV8xMDE5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzEwMTkub2JqZWN0KSwgcHJvcGVydHk6IHRlcm1fMTAxOS5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzEwMjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiB0ZXJtXzEwMjAuZWxlbWVudHMubWFwKHRfMTAyMSA9PiB0XzEwMjEgPT0gbnVsbCA/IHRfMTAyMSA6IHRoaXMuZXhwYW5kKHRfMTAyMSkpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fMTAyMikge1xuICAgIHJldHVybiB0ZXJtXzEwMjI7XG4gIH1cbiAgZXhwYW5kSW1wb3J0TmFtZXNwYWNlKHRlcm1fMTAyMykge1xuICAgIHJldHVybiB0ZXJtXzEwMjM7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fMTAyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fMTAyNC5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fMTAyNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fMTAyNS5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydEZyb20odGVybV8xMDI2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTAyNjtcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fMTAyNykge1xuICAgIHJldHVybiB0ZXJtXzEwMjc7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fMTAyOCkge1xuICAgIHJldHVybiB0ZXJtXzEwMjg7XG4gIH1cbiAgZXhwYW5kU3RhdGljUHJvcGVydHlOYW1lKHRlcm1fMTAyOSkge1xuICAgIHJldHVybiB0ZXJtXzEwMjk7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fMTAzMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDMwLm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwMzAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fMTAzMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHRlcm1fMTAzMS5wcm9wZXJ0aWVzLm1hcCh0XzEwMzIgPT4gdGhpcy5leHBhbmQodF8xMDMyKSl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybV8xMDMzKSB7XG4gICAgbGV0IGluaXRfMTAzNCA9IHRlcm1fMTAzMy5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV8xMDMzLmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDMzLmJpbmRpbmcpLCBpbml0OiBpbml0XzEwMzR9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fMTAzNSkge1xuICAgIGlmICh0ZXJtXzEwMzUua2luZCA9PT0gXCJzeW50YXhcIiB8fCB0ZXJtXzEwMzUua2luZCA9PT0gXCJzeW50YXhyZWNcIikge1xuICAgICAgcmV0dXJuIHRlcm1fMTAzNTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDogdGVybV8xMDM1LmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzEwMzUuZGVjbGFyYXRvcnMubWFwKGRfMTAzNiA9PiB0aGlzLmV4cGFuZChkXzEwMzYpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fMTAzNykge1xuICAgIGlmICh0ZXJtXzEwMzcuaW5uZXIuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBlbmQgb2YgaW5wdXRcIik7XG4gICAgfVxuICAgIGxldCBlbmZfMTAzOCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fMTAzNy5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfMTAzOSA9IGVuZl8xMDM4LnBlZWsoKTtcbiAgICBsZXQgdF8xMDQwID0gZW5mXzEwMzguZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRfMTA0MCA9PSBudWxsIHx8IGVuZl8xMDM4LnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZl8xMDM4LmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMDM5LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF8xMDQwKTtcbiAgfVxuICBleHBhbmRVbmFyeUV4cHJlc3Npb24odGVybV8xMDQxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVW5hcnlFeHByZXNzaW9uXCIsIHtvcGVyYXRvcjogdGVybV8xMDQxLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNDEub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRVcGRhdGVFeHByZXNzaW9uKHRlcm1fMTA0Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiB0ZXJtXzEwNDIuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzEwNDIub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Mi5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZEJpbmFyeUV4cHJlc3Npb24odGVybV8xMDQzKSB7XG4gICAgbGV0IGxlZnRfMTA0NCA9IHRoaXMuZXhwYW5kKHRlcm1fMTA0My5sZWZ0KTtcbiAgICBsZXQgcmlnaHRfMTA0NSA9IHRoaXMuZXhwYW5kKHRlcm1fMTA0My5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xMDQ0LCBvcGVyYXRvcjogdGVybV8xMDQzLm9wZXJhdG9yLCByaWdodDogcmlnaHRfMTA0NX0pO1xuICB9XG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtXzEwNDYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Ni50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV8xMDQ2LmNvbnNlcXVlbnQpLCBhbHRlcm5hdGU6IHRoaXMuZXhwYW5kKHRlcm1fMTA0Ni5hbHRlcm5hdGUpfSk7XG4gIH1cbiAgZXhwYW5kTmV3VGFyZ2V0RXhwcmVzc2lvbih0ZXJtXzEwNDcpIHtcbiAgICByZXR1cm4gdGVybV8xMDQ3O1xuICB9XG4gIGV4cGFuZE5ld0V4cHJlc3Npb24odGVybV8xMDQ4KSB7XG4gICAgbGV0IGNhbGxlZV8xMDQ5ID0gdGhpcy5leHBhbmQodGVybV8xMDQ4LmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDUwID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDQ4LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNTEgPSBlbmZfMTA1MC5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA1MiA9PiB0aGlzLmV4cGFuZChhcmdfMTA1MikpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEwNDksIGFyZ3VtZW50czogYXJnc18xMDUxLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fMTA1Mykge1xuICAgIHJldHVybiB0ZXJtXzEwNTM7XG4gIH1cbiAgZXhwYW5kQ2FsbEV4cHJlc3Npb24odGVybV8xMDU0KSB7XG4gICAgbGV0IGNhbGxlZV8xMDU1ID0gdGhpcy5leHBhbmQodGVybV8xMDU0LmNhbGxlZSk7XG4gICAgbGV0IGVuZl8xMDU2ID0gbmV3IEVuZm9yZXN0ZXIodGVybV8xMDU0LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzEwNTcgPSBlbmZfMTA1Ni5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfMTA1OCA9PiB0aGlzLmV4cGFuZChhcmdfMTA1OCkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMDU1LCBhcmd1bWVudHM6IGFyZ3NfMTA1N30pO1xuICB9XG4gIGV4cGFuZFNwcmVhZEVsZW1lbnQodGVybV8xMDU5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV8xMDU5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzEwNjApIHtcbiAgICBsZXQgY2hpbGRfMTA2MSA9IHRoaXMuZXhwYW5kKHRlcm1fMTA2MC5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF8xMDYxfSk7XG4gIH1cbiAgZXhwYW5kTGFiZWxlZFN0YXRlbWVudCh0ZXJtXzEwNjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV8xMDYyLmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzEwNjIuYm9keSl9KTtcbiAgfVxuICBkb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA2MywgdHlwZV8xMDY0KSB7XG4gICAgbGV0IHNjb3BlXzEwNjUgPSBmcmVzaFNjb3BlKFwiZnVuXCIpO1xuICAgIGxldCByZWRfMTA2NiA9IG5ldyBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyKHNjb3BlXzEwNjUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc18xMDY3O1xuICAgIGlmICh0eXBlXzEwNjQgIT09IFwiR2V0dGVyXCIgJiYgdHlwZV8xMDY0ICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfMTA2NyA9IHJlZF8xMDY2LnRyYW5zZm9ybSh0ZXJtXzEwNjMucGFyYW1zKTtcbiAgICAgIHBhcmFtc18xMDY3ID0gdGhpcy5leHBhbmQocGFyYW1zXzEwNjcpO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfMTA2NSk7XG4gICAgbGV0IGNvbXBpbGVyXzEwNjggPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfMTA2OSwgYm9keVRlcm1fMTA3MDtcbiAgICBpZiAodGVybV8xMDYzLmJvZHkgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICBib2R5VGVybV8xMDcwID0gdGhpcy5leHBhbmQodGVybV8xMDYzLmJvZHkuYWRkU2NvcGUoc2NvcGVfMTA2NSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlZEJvZHlfMTA2OSA9IHRlcm1fMTA2My5ib2R5Lm1hcChiXzEwNzEgPT4gYl8xMDcxLmFkZFNjb3BlKHNjb3BlXzEwNjUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgICAgYm9keVRlcm1fMTA3MCA9IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0KCksIHN0YXRlbWVudHM6IGNvbXBpbGVyXzEwNjguY29tcGlsZShtYXJrZWRCb2R5XzEwNjkpfSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucG9wKCk7XG4gICAgaWYgKHR5cGVfMTA2NCA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA2NCwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fMTA2My5uYW1lKSwgYm9keTogYm9keVRlcm1fMTA3MH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZV8xMDY0ID09PSBcIlNldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDY0LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV8xMDYzLm5hbWUpLCBwYXJhbTogdGVybV8xMDYzLnBhcmFtLCBib2R5OiBib2R5VGVybV8xMDcwfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNjQsIHtuYW1lOiB0ZXJtXzEwNjMubmFtZSwgaXNHZW5lcmF0b3I6IHRlcm1fMTA2My5pc0dlbmVyYXRvciwgcGFyYW1zOiBwYXJhbXNfMTA2NywgYm9keTogYm9keVRlcm1fMTA3MH0pO1xuICB9XG4gIGV4cGFuZE1ldGhvZCh0ZXJtXzEwNzIpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fMTA3MiwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fMTA3Mykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV8xMDczLCBcIlNldHRlclwiKTtcbiAgfVxuICBleHBhbmRHZXR0ZXIodGVybV8xMDc0KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNzQsIFwiR2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV8xMDc1KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNzUsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV8xMDc2KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzEwNzYsIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZENvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV8xMDc3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDc3LmJpbmRpbmcpLCBvcGVyYXRvcjogdGVybV8xMDc3Lm9wZXJhdG9yLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzEwNzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV8xMDc4LmJpbmRpbmcpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzEwNzguZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzEwNzkpIHtcbiAgICByZXR1cm4gdGVybV8xMDc5O1xuICB9XG4gIGV4cGFuZExpdGVyYWxCb29sZWFuRXhwcmVzc2lvbih0ZXJtXzEwODApIHtcbiAgICByZXR1cm4gdGVybV8xMDgwO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdW1lcmljRXhwcmVzc2lvbih0ZXJtXzEwODEpIHtcbiAgICByZXR1cm4gdGVybV8xMDgxO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV8xMDgyKSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4MjtcbiAgfVxuICBleHBhbmRJZGVudGlmaWVyRXhwcmVzc2lvbih0ZXJtXzEwODMpIHtcbiAgICBsZXQgdHJhbnNfMTA4NCA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMTA4My5uYW1lLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSk7XG4gICAgaWYgKHRyYW5zXzEwODQpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc18xMDg0LmlkfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtXzEwODM7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bGxFeHByZXNzaW9uKHRlcm1fMTA4NSkge1xuICAgIHJldHVybiB0ZXJtXzEwODU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24odGVybV8xMDg2KSB7XG4gICAgcmV0dXJuIHRlcm1fMTA4NjtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzEwODcpIHtcbiAgICByZXR1cm4gdGVybV8xMDg3O1xuICB9XG59XG4iXX0=