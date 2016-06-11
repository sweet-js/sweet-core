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
  constructor(context_909) {
    super("expand", true);
    this.context = context_909;
  }
  expand(term_910) {
    return this.dispatch(term_910);
  }
  expandPragma(term_911) {
    return term_911;
  }
  expandTemplateExpression(term_912) {
    return new _terms2.default("TemplateExpression", { tag: term_912.tag == null ? null : this.expand(term_912.tag), elements: term_912.elements.toArray() });
  }
  expandBreakStatement(term_913) {
    return new _terms2.default("BreakStatement", { label: term_913.label ? term_913.label.val() : null });
  }
  expandDoWhileStatement(term_914) {
    return new _terms2.default("DoWhileStatement", { body: this.expand(term_914.body), test: this.expand(term_914.test) });
  }
  expandWithStatement(term_915) {
    return new _terms2.default("WithStatement", { body: this.expand(term_915.body), object: this.expand(term_915.object) });
  }
  expandDebuggerStatement(term_916) {
    return term_916;
  }
  expandContinueStatement(term_917) {
    return new _terms2.default("ContinueStatement", { label: term_917.label ? term_917.label.val() : null });
  }
  expandSwitchStatementWithDefault(term_918) {
    return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_918.discriminant), preDefaultCases: term_918.preDefaultCases.map(c_919 => this.expand(c_919)).toArray(), defaultCase: this.expand(term_918.defaultCase), postDefaultCases: term_918.postDefaultCases.map(c_920 => this.expand(c_920)).toArray() });
  }
  expandComputedMemberExpression(term_921) {
    return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_921.object), expression: this.expand(term_921.expression) });
  }
  expandSwitchStatement(term_922) {
    return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_922.discriminant), cases: term_922.cases.map(c_923 => this.expand(c_923)).toArray() });
  }
  expandFormalParameters(term_924) {
    let rest_925 = term_924.rest == null ? null : this.expand(term_924.rest);
    return new _terms2.default("FormalParameters", { items: term_924.items.map(i_926 => this.expand(i_926)), rest: rest_925 });
  }
  expandArrowExpression(term_927) {
    return this.doFunctionExpansion(term_927, "ArrowExpression");
  }
  expandSwitchDefault(term_928) {
    return new _terms2.default("SwitchDefault", { consequent: term_928.consequent.map(c_929 => this.expand(c_929)).toArray() });
  }
  expandSwitchCase(term_930) {
    return new _terms2.default("SwitchCase", { test: this.expand(term_930.test), consequent: term_930.consequent.map(c_931 => this.expand(c_931)).toArray() });
  }
  expandForInStatement(term_932) {
    return new _terms2.default("ForInStatement", { left: this.expand(term_932.left), right: this.expand(term_932.right), body: this.expand(term_932.body) });
  }
  expandTryCatchStatement(term_933) {
    return new _terms2.default("TryCatchStatement", { body: this.expand(term_933.body), catchClause: this.expand(term_933.catchClause) });
  }
  expandTryFinallyStatement(term_934) {
    let catchClause_935 = term_934.catchClause == null ? null : this.expand(term_934.catchClause);
    return new _terms2.default("TryFinallyStatement", { body: this.expand(term_934.body), catchClause: catchClause_935, finalizer: this.expand(term_934.finalizer) });
  }
  expandCatchClause(term_936) {
    return new _terms2.default("CatchClause", { binding: this.expand(term_936.binding), body: this.expand(term_936.body) });
  }
  expandThrowStatement(term_937) {
    return new _terms2.default("ThrowStatement", { expression: this.expand(term_937.expression) });
  }
  expandForOfStatement(term_938) {
    return new _terms2.default("ForOfStatement", { left: this.expand(term_938.left), right: this.expand(term_938.right), body: this.expand(term_938.body) });
  }
  expandBindingIdentifier(term_939) {
    return term_939;
  }
  expandBindingPropertyIdentifier(term_940) {
    return term_940;
  }
  expandBindingPropertyProperty(term_941) {
    return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_941.name), binding: this.expand(term_941.binding) });
  }
  expandComputedPropertyName(term_942) {
    return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_942.expression) });
  }
  expandObjectBinding(term_943) {
    return new _terms2.default("ObjectBinding", { properties: term_943.properties.map(t_944 => this.expand(t_944)).toArray() });
  }
  expandArrayBinding(term_945) {
    let restElement_946 = term_945.restElement == null ? null : this.expand(term_945.restElement);
    return new _terms2.default("ArrayBinding", { elements: term_945.elements.map(t_947 => t_947 == null ? null : this.expand(t_947)).toArray(), restElement: restElement_946 });
  }
  expandBindingWithDefault(term_948) {
    return new _terms2.default("BindingWithDefault", { binding: this.expand(term_948.binding), init: this.expand(term_948.init) });
  }
  expandShorthandProperty(term_949) {
    return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_949.name }), expression: new _terms2.default("IdentifierExpression", { name: term_949.name }) });
  }
  expandForStatement(term_950) {
    let init_951 = term_950.init == null ? null : this.expand(term_950.init);
    let test_952 = term_950.test == null ? null : this.expand(term_950.test);
    let update_953 = term_950.update == null ? null : this.expand(term_950.update);
    let body_954 = this.expand(term_950.body);
    return new _terms2.default("ForStatement", { init: init_951, test: test_952, update: update_953, body: body_954 });
  }
  expandYieldExpression(term_955) {
    let expr_956 = term_955.expression == null ? null : this.expand(term_955.expression);
    return new _terms2.default("YieldExpression", { expression: expr_956 });
  }
  expandYieldGeneratorExpression(term_957) {
    let expr_958 = term_957.expression == null ? null : this.expand(term_957.expression);
    return new _terms2.default("YieldGeneratorExpression", { expression: expr_958 });
  }
  expandWhileStatement(term_959) {
    return new _terms2.default("WhileStatement", { test: this.expand(term_959.test), body: this.expand(term_959.body) });
  }
  expandIfStatement(term_960) {
    let consequent_961 = term_960.consequent == null ? null : this.expand(term_960.consequent);
    let alternate_962 = term_960.alternate == null ? null : this.expand(term_960.alternate);
    return new _terms2.default("IfStatement", { test: this.expand(term_960.test), consequent: consequent_961, alternate: alternate_962 });
  }
  expandBlockStatement(term_963) {
    return new _terms2.default("BlockStatement", { block: this.expand(term_963.block) });
  }
  expandBlock(term_964) {
    return new _terms2.default("Block", { statements: term_964.statements.map(s_965 => this.expand(s_965)).toArray() });
  }
  expandVariableDeclarationStatement(term_966) {
    return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_966.declaration) });
  }
  expandReturnStatement(term_967) {
    if (term_967.expression == null) {
      return term_967;
    }
    return new _terms2.default("ReturnStatement", { expression: this.expand(term_967.expression) });
  }
  expandClassDeclaration(term_968) {
    return new _terms2.default("ClassDeclaration", { name: term_968.name == null ? null : this.expand(term_968.name), super: term_968.super == null ? null : this.expand(term_968.super), elements: term_968.elements.map(el_969 => this.expand(el_969)).toArray() });
  }
  expandClassExpression(term_970) {
    return new _terms2.default("ClassExpression", { name: term_970.name == null ? null : this.expand(term_970.name), super: term_970.super == null ? null : this.expand(term_970.super), elements: term_970.elements.map(el_971 => this.expand(el_971)).toArray() });
  }
  expandClassElement(term_972) {
    return new _terms2.default("ClassElement", { isStatic: term_972.isStatic, method: this.expand(term_972.method) });
  }
  expandThisExpression(term_973) {
    return term_973;
  }
  expandSyntaxTemplate(term_974) {
    let r_975 = (0, _templateProcessor.processTemplate)(term_974.template.inner());
    let str_976 = _syntax2.default.from("string", _serializer.serializer.write(r_975.template));
    let callee_977 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.from("identifier", "syntaxTemplate") });
    let expandedInterps_978 = r_975.interp.map(i_980 => {
      let enf_981 = new _enforester.Enforester(i_980, (0, _immutable.List)(), this.context);
      return this.expand(enf_981.enforest("expression"));
    });
    let args_979 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_976 })).concat(expandedInterps_978);
    return new _terms2.default("CallExpression", { callee: callee_977, arguments: args_979 });
  }
  expandSyntaxQuote(term_982) {
    let str_983 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.from("string", _serializer.serializer.write(term_982.name)) });
    return new _terms2.default("TemplateExpression", { tag: term_982.template.tag, elements: term_982.template.elements.push(str_983).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
  }
  expandStaticMemberExpression(term_984) {
    return new _terms2.default("StaticMemberExpression", { object: this.expand(term_984.object), property: term_984.property });
  }
  expandArrayExpression(term_985) {
    return new _terms2.default("ArrayExpression", { elements: term_985.elements.map(t_986 => t_986 == null ? t_986 : this.expand(t_986)) });
  }
  expandImport(term_987) {
    return term_987;
  }
  expandImportNamespace(term_988) {
    return term_988;
  }
  expandExport(term_989) {
    return new _terms2.default("Export", { declaration: this.expand(term_989.declaration) });
  }
  expandExportDefault(term_990) {
    return new _terms2.default("ExportDefault", { body: this.expand(term_990.body) });
  }
  expandExportFrom(term_991) {
    return term_991;
  }
  expandExportAllFrom(term_992) {
    return term_992;
  }
  expandExportSpecifier(term_993) {
    return term_993;
  }
  expandStaticPropertyName(term_994) {
    return term_994;
  }
  expandDataProperty(term_995) {
    return new _terms2.default("DataProperty", { name: this.expand(term_995.name), expression: this.expand(term_995.expression) });
  }
  expandObjectExpression(term_996) {
    return new _terms2.default("ObjectExpression", { properties: term_996.properties.map(t_997 => this.expand(t_997)) });
  }
  expandVariableDeclarator(term_998) {
    let init_999 = term_998.init == null ? null : this.expand(term_998.init);
    return new _terms2.default("VariableDeclarator", { binding: this.expand(term_998.binding), init: init_999 });
  }
  expandVariableDeclaration(term_1000) {
    if (term_1000.kind === "syntax" || term_1000.kind === "syntaxrec") {
      return term_1000;
    }
    return new _terms2.default("VariableDeclaration", { kind: term_1000.kind, declarators: term_1000.declarators.map(d_1001 => this.expand(d_1001)) });
  }
  expandParenthesizedExpression(term_1002) {
    if (term_1002.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf_1003 = new _enforester.Enforester(term_1002.inner, (0, _immutable.List)(), this.context);
    let lookahead_1004 = enf_1003.peek();
    let t_1005 = enf_1003.enforestExpression();
    if (t_1005 == null || enf_1003.rest.size > 0) {
      throw enf_1003.createError(lookahead_1004, "unexpected syntax");
    }
    return this.expand(t_1005);
  }
  expandUnaryExpression(term_1006) {
    return new _terms2.default("UnaryExpression", { operator: term_1006.operator, operand: this.expand(term_1006.operand) });
  }
  expandUpdateExpression(term_1007) {
    return new _terms2.default("UpdateExpression", { isPrefix: term_1007.isPrefix, operator: term_1007.operator, operand: this.expand(term_1007.operand) });
  }
  expandBinaryExpression(term_1008) {
    let left_1009 = this.expand(term_1008.left);
    let right_1010 = this.expand(term_1008.right);
    return new _terms2.default("BinaryExpression", { left: left_1009, operator: term_1008.operator, right: right_1010 });
  }
  expandConditionalExpression(term_1011) {
    return new _terms2.default("ConditionalExpression", { test: this.expand(term_1011.test), consequent: this.expand(term_1011.consequent), alternate: this.expand(term_1011.alternate) });
  }
  expandNewTargetExpression(term_1012) {
    return term_1012;
  }
  expandNewExpression(term_1013) {
    let callee_1014 = this.expand(term_1013.callee);
    let enf_1015 = new _enforester.Enforester(term_1013.arguments, (0, _immutable.List)(), this.context);
    let args_1016 = enf_1015.enforestArgumentList().map(arg_1017 => this.expand(arg_1017));
    return new _terms2.default("NewExpression", { callee: callee_1014, arguments: args_1016.toArray() });
  }
  expandSuper(term_1018) {
    return term_1018;
  }
  expandCallExpression(term_1019) {
    let callee_1020 = this.expand(term_1019.callee);
    let enf_1021 = new _enforester.Enforester(term_1019.arguments, (0, _immutable.List)(), this.context);
    let args_1022 = enf_1021.enforestArgumentList().map(arg_1023 => this.expand(arg_1023));
    return new _terms2.default("CallExpression", { callee: callee_1020, arguments: args_1022 });
  }
  expandSpreadElement(term_1024) {
    return new _terms2.default("SpreadElement", { expression: this.expand(term_1024.expression) });
  }
  expandExpressionStatement(term_1025) {
    let child_1026 = this.expand(term_1025.expression);
    return new _terms2.default("ExpressionStatement", { expression: child_1026 });
  }
  expandLabeledStatement(term_1027) {
    return new _terms2.default("LabeledStatement", { label: term_1027.label.val(), body: this.expand(term_1027.body) });
  }
  doFunctionExpansion(term_1028, type_1029) {
    let scope_1030 = (0, _scope.freshScope)("fun");
    let red_1031 = new _applyScopeInParamsReducer2.default(scope_1030, this.context);
    let params_1032;
    if (type_1029 !== "Getter" && type_1029 !== "Setter") {
      params_1032 = red_1031.transform(term_1028.params);
      params_1032 = this.expand(params_1032);
    }
    this.context.currentScope.push(scope_1030);
    let compiler_1033 = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);
    let markedBody_1034, bodyTerm_1035;
    if (term_1028.body instanceof _terms2.default) {
      bodyTerm_1035 = this.expand(term_1028.body.addScope(scope_1030, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody_1034 = term_1028.body.map(b_1036 => b_1036.addScope(scope_1030, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm_1035 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: compiler_1033.compile(markedBody_1034) });
    }
    this.context.currentScope.pop();
    if (type_1029 === "Getter") {
      return new _terms2.default(type_1029, { name: this.expand(term_1028.name), body: bodyTerm_1035 });
    } else if (type_1029 === "Setter") {
      return new _terms2.default(type_1029, { name: this.expand(term_1028.name), param: term_1028.param, body: bodyTerm_1035 });
    }
    return new _terms2.default(type_1029, { name: term_1028.name, isGenerator: term_1028.isGenerator, params: params_1032, body: bodyTerm_1035 });
  }
  expandMethod(term_1037) {
    return this.doFunctionExpansion(term_1037, "Method");
  }
  expandSetter(term_1038) {
    return this.doFunctionExpansion(term_1038, "Setter");
  }
  expandGetter(term_1039) {
    return this.doFunctionExpansion(term_1039, "Getter");
  }
  expandFunctionDeclaration(term_1040) {
    return this.doFunctionExpansion(term_1040, "FunctionDeclaration");
  }
  expandFunctionExpression(term_1041) {
    return this.doFunctionExpansion(term_1041, "FunctionExpression");
  }
  expandCompoundAssignmentExpression(term_1042) {
    return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_1042.binding), operator: term_1042.operator, expression: this.expand(term_1042.expression) });
  }
  expandAssignmentExpression(term_1043) {
    return new _terms2.default("AssignmentExpression", { binding: this.expand(term_1043.binding), expression: this.expand(term_1043.expression) });
  }
  expandEmptyStatement(term_1044) {
    return term_1044;
  }
  expandLiteralBooleanExpression(term_1045) {
    return term_1045;
  }
  expandLiteralNumericExpression(term_1046) {
    return term_1046;
  }
  expandLiteralInfinityExpression(term_1047) {
    return term_1047;
  }
  expandIdentifierExpression(term_1048) {
    let trans_1049 = this.context.env.get(term_1048.name.resolve(this.context.phase));
    if (trans_1049) {
      return new _terms2.default("IdentifierExpression", { name: trans_1049.id });
    }
    return term_1048;
  }
  expandLiteralNullExpression(term_1050) {
    return term_1050;
  }
  expandLiteralStringExpression(term_1051) {
    return term_1051;
  }
  expandLiteralRegExpExpression(term_1052) {
    return term_1052;
  }
}
exports.default = TermExpander;