"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _scope = require("./scope");

var _applyScopeInParamsReducer = require("./apply-scope-in-params-reducer");

var _applyScopeInParamsReducer2 = _interopRequireDefault(_applyScopeInParamsReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _expander = require("./expander");

var _expander2 = _interopRequireDefault(_expander);

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _serializer = require("./serializer");

var _enforester = require("./enforester");

var _errors = require("./errors");

var _templateProcessor = require("./template-processor.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TermExpander = function () {
  function TermExpander(context_741) {
    _classCallCheck(this, TermExpander);

    this.context = context_741;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_742) {
      var field_743 = "expand" + term_742.type;
      if (typeof this[field_743] === "function") {
        return this[field_743](term_742);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_742.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_744) {
      return new _terms2.default("TemplateExpression", { tag: term_744.tag == null ? null : this.expand(term_744.tag), elements: term_744.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_745) {
      return new _terms2.default("BreakStatement", { label: term_745.label ? term_745.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_746) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_746.body), test: this.expand(term_746.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_747) {
      return new _terms2.default("WithStatement", { body: this.expand(term_747.body), object: this.expand(term_747.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_748) {
      return term_748;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_749) {
      return new _terms2.default("ContinueStatement", { label: term_749.label ? term_749.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_750) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_750.discriminant), preDefaultCases: term_750.preDefaultCases.map(function (c_751) {
          return _this.expand(c_751);
        }).toArray(), defaultCase: this.expand(term_750.defaultCase), postDefaultCases: term_750.postDefaultCases.map(function (c_752) {
          return _this.expand(c_752);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_753) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_753.object), expression: this.expand(term_753.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_754) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_754.discriminant), cases: term_754.cases.map(function (c_755) {
          return _this2.expand(c_755);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_756) {
      var _this3 = this;

      var rest_757 = term_756.rest == null ? null : this.expand(term_756.rest);
      return new _terms2.default("FormalParameters", { items: term_756.items.map(function (i_758) {
          return _this3.expand(i_758);
        }), rest: rest_757 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_759) {
      return this.doFunctionExpansion(term_759, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_760) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_760.consequent.map(function (c_761) {
          return _this4.expand(c_761);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_762) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_762.test), consequent: term_762.consequent.map(function (c_763) {
          return _this5.expand(c_763);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_764) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_764.left), right: this.expand(term_764.right), body: this.expand(term_764.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_765) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_765.body), catchClause: this.expand(term_765.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_766) {
      var catchClause_767 = term_766.catchClause == null ? null : this.expand(term_766.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_766.body), catchClause: catchClause_767, finalizer: this.expand(term_766.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_768) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_768.binding), body: this.expand(term_768.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_769) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_769.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_770) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_770.left), right: this.expand(term_770.right), body: this.expand(term_770.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_771) {
      return term_771;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_772) {
      return term_772;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_773) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_773.name), binding: this.expand(term_773.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_774) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_774.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_775) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_775.properties.map(function (t_776) {
          return _this6.expand(t_776);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_777) {
      var _this7 = this;

      var restElement_778 = term_777.restElement == null ? null : this.expand(term_777.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_777.elements.map(function (t_779) {
          return t_779 == null ? null : _this7.expand(t_779);
        }).toArray(), restElement: restElement_778 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_780) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_780.binding), init: this.expand(term_780.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_781) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_781.name }), expression: new _terms2.default("IdentifierExpression", { name: term_781.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_782) {
      var init_783 = term_782.init == null ? null : this.expand(term_782.init);
      var test_784 = term_782.test == null ? null : this.expand(term_782.test);
      var update_785 = term_782.update == null ? null : this.expand(term_782.update);
      var body_786 = this.expand(term_782.body);
      return new _terms2.default("ForStatement", { init: init_783, test: test_784, update: update_785, body: body_786 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_787) {
      var expr_788 = term_787.expression == null ? null : this.expand(term_787.expression);
      return new _terms2.default("YieldExpression", { expression: expr_788 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_789) {
      var expr_790 = term_789.expression == null ? null : this.expand(term_789.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_790 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_791) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_791.test), body: this.expand(term_791.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_792) {
      var consequent_793 = term_792.consequent == null ? null : this.expand(term_792.consequent);
      var alternate_794 = term_792.alternate == null ? null : this.expand(term_792.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_792.test), consequent: consequent_793, alternate: alternate_794 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_795) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_795.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_796) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_796.statements.map(function (s_797) {
          return _this8.expand(s_797);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_798) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_798.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_799) {
      if (term_799.expression == null) {
        return term_799;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_799.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_800) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_800.name == null ? null : this.expand(term_800.name), super: term_800.super == null ? null : this.expand(term_800.super), elements: term_800.elements.map(function (el_801) {
          return _this9.expand(el_801);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_802) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_802.name == null ? null : this.expand(term_802.name), super: term_802.super == null ? null : this.expand(term_802.super), elements: term_802.elements.map(function (el_803) {
          return _this10.expand(el_803);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_804) {
      return new _terms2.default("ClassElement", { isStatic: term_804.isStatic, method: this.expand(term_804.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_805) {
      return term_805;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_806) {
      var _this11 = this;

      var expander_807 = new _expander2.default(this.context);
      var r_808 = (0, _templateProcessor.processTemplate)(term_806.template.inner());
      var str_809 = _syntax2.default.fromString(_serializer.serializer.write(r_808.template));
      var callee_810 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_811 = r_808.interp.map(function (i_813) {
        var enf_814 = new _enforester.Enforester(i_813, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_814.enforest("expression"));
      });
      var args_812 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_809 })).concat(expandedInterps_811);
      return new _terms2.default("CallExpression", { callee: callee_810, arguments: args_812 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_815) {
      var str_816 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_815.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_815.template.tag, elements: term_815.template.elements.push(str_816).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_817) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_817.object), property: term_817.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_818) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_818.elements.map(function (t_819) {
          return t_819 == null ? t_819 : _this12.expand(t_819);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_820) {
      return term_820;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_821) {
      return term_821;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_822) {
      return new _terms2.default("Export", { declaration: this.expand(term_822.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_823) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_823.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_824) {
      return term_824;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_825) {
      return term_825;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_826) {
      return term_826;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_827) {
      return term_827;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_828) {
      return new _terms2.default("DataProperty", { name: this.expand(term_828.name), expression: this.expand(term_828.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_829) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_829.properties.map(function (t_830) {
          return _this13.expand(t_830);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_831) {
      var init_832 = term_831.init == null ? null : this.expand(term_831.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_831.binding), init: init_832 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_833) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_833.kind, declarators: term_833.declarators.map(function (d_834) {
          return _this14.expand(d_834);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_835) {
      if (term_835.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_836 = new _enforester.Enforester(term_835.inner, (0, _immutable.List)(), this.context);
      var lookahead_837 = enf_836.peek();
      var t_838 = enf_836.enforestExpression();
      if (t_838 == null || enf_836.rest.size > 0) {
        throw enf_836.createError(lookahead_837, "unexpected syntax");
      }
      return this.expand(t_838);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_839) {
      return new _terms2.default("UnaryExpression", { operator: term_839.operator, operand: this.expand(term_839.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_840) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_840.isPrefix, operator: term_840.operator, operand: this.expand(term_840.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_841) {
      var left_842 = this.expand(term_841.left);
      var right_843 = this.expand(term_841.right);
      return new _terms2.default("BinaryExpression", { left: left_842, operator: term_841.operator, right: right_843 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_844) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_844.test), consequent: this.expand(term_844.consequent), alternate: this.expand(term_844.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_845) {
      return term_845;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_846) {
      var _this15 = this;

      var callee_847 = this.expand(term_846.callee);
      var enf_848 = new _enforester.Enforester(term_846.arguments, (0, _immutable.List)(), this.context);
      var args_849 = enf_848.enforestArgumentList().map(function (arg_850) {
        return _this15.expand(arg_850);
      });
      return new _terms2.default("NewExpression", { callee: callee_847, arguments: args_849.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_851) {
      return term_851;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_852) {
      var _this16 = this;

      var callee_853 = this.expand(term_852.callee);
      var enf_854 = new _enforester.Enforester(term_852.arguments, (0, _immutable.List)(), this.context);
      var args_855 = enf_854.enforestArgumentList().map(function (arg_856) {
        return _this16.expand(arg_856);
      });
      return new _terms2.default("CallExpression", { callee: callee_853, arguments: args_855 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_857) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_857.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_858) {
      var child_859 = this.expand(term_858.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_859 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_860) {
      return new _terms2.default("LabeledStatement", { label: term_860.label.val(), body: this.expand(term_860.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_861, type_862) {
      var _this17 = this;

      var scope_863 = (0, _scope.freshScope)("fun");
      var red_864 = new _applyScopeInParamsReducer2.default(scope_863, this.context);
      var params_865 = void 0;
      if (type_862 !== "Getter" && type_862 !== "Setter") {
        params_865 = red_864.transform(term_861.params);
        params_865 = this.expand(params_865);
      }
      this.context.currentScope.push(scope_863);
      var expander_866 = new _expander2.default(this.context);
      var markedBody_867 = void 0,
          bodyTerm_868 = void 0;
      if (term_861.body instanceof _terms2.default) {
        bodyTerm_868 = this.expand(term_861.body.addScope(scope_863, this.context.bindings));
      } else {
        markedBody_867 = term_861.body.map(function (b_869) {
          return b_869.addScope(scope_863, _this17.context.bindings);
        });
        bodyTerm_868 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_866.expand(markedBody_867) });
      }
      this.context.currentScope.pop();
      if (type_862 === "Getter") {
        return new _terms2.default(type_862, { name: this.expand(term_861.name), body: bodyTerm_868 });
      } else if (type_862 === "Setter") {
        return new _terms2.default(type_862, { name: this.expand(term_861.name), param: term_861.param, body: bodyTerm_868 });
      }
      return new _terms2.default(type_862, { name: term_861.name, isGenerator: term_861.isGenerator, params: params_865, body: bodyTerm_868 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_870) {
      return this.doFunctionExpansion(term_870, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_871) {
      return this.doFunctionExpansion(term_871, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_872) {
      return this.doFunctionExpansion(term_872, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_873) {
      return this.doFunctionExpansion(term_873, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_874) {
      return this.doFunctionExpansion(term_874, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_875) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_875.binding), operator: term_875.operator, expression: this.expand(term_875.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_876) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_876.binding), expression: this.expand(term_876.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_877) {
      return term_877;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_878) {
      return term_878;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_879) {
      return term_879;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_880) {
      return term_880;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_881) {
      var trans_882 = this.context.env.get(term_881.name.resolve());
      if (trans_882) {
        return new _terms2.default("IdentifierExpression", { name: trans_882.id });
      }
      return term_881;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_883) {
      return term_883;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_884) {
      return term_884;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_885) {
      return term_885;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztJQUNxQixZO0FBQ25CLHdCQUFZLFdBQVosRUFBeUI7QUFBQTs7QUFDdkIsU0FBSyxPQUFMLEdBQWUsV0FBZjtBQUNEOzs7OzJCQUNNLFEsRUFBVTtBQUNmLFVBQUksWUFBWSxXQUFXLFNBQVMsSUFBcEM7QUFDQSxVQUFJLE9BQU8sS0FBSyxTQUFMLENBQVAsS0FBMkIsVUFBL0IsRUFBMkM7QUFDekMsZUFBTyxLQUFLLFNBQUwsRUFBZ0IsUUFBaEIsQ0FBUDtBQUNEO0FBQ0QsMEJBQU8sS0FBUCxFQUFjLHFDQUFxQyxTQUFTLElBQTVEO0FBQ0Q7Ozs2Q0FDd0IsUSxFQUFVO0FBQ2pDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDs7O3lDQUNvQixRLEVBQVU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sU0FBUyxLQUFULEdBQWlCLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBakIsR0FBd0MsSUFBaEQsRUFBM0IsQ0FBUDtBQUNEOzs7MkNBQ3NCLFEsRUFBVTtBQUMvQixhQUFPLG9CQUFTLGtCQUFULEVBQTZCLEVBQUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQVAsRUFBbUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQXpDLEVBQTdCLENBQVA7QUFDRDs7O3dDQUNtQixRLEVBQVU7QUFDNUIsYUFBTyxvQkFBUyxl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SyxNQUFMLENBQVksU0FBUyxVQUFyQixDQUFsRixFQUF6QyxDQUFQO0FBQ0Q7OzsrQ0FDMEIsUSxFQUFVO0FBQ25DLGFBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxTQUFTLEtBQUssTUFBTCxDQUFZLFNBQVMsT0FBckIsQ0FBVixFQUF5QyxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQVMsVUFBckIsQ0FBckQsRUFBakMsQ0FBUDtBQUNEOzs7eUNBQ29CLFEsRUFBVTtBQUM3QixhQUFPLFFBQVA7QUFDRDs7O21EQUM4QixRLEVBQVU7QUFDdkMsYUFBTyxRQUFQO0FBQ0Q7OzttREFDOEIsUSxFQUFVO0FBQ3ZDLGFBQU8sUUFBUDtBQUNEOzs7b0RBQytCLFEsRUFBVTtBQUN4QyxhQUFPLFFBQVA7QUFDRDs7OytDQUMwQixRLEVBQVU7QUFDbkMsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxJQUFULENBQWMsT0FBZCxFQUFyQixDQUFoQjtBQUNBLFVBQUksU0FBSixFQUFlO0FBQ2IsZUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sVUFBVSxFQUFqQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxhQUFPLFFBQVA7QUFDRDs7O2dEQUMyQixRLEVBQVU7QUFDcEMsYUFBTyxRQUFQO0FBQ0Q7OztrREFDNkIsUSxFQUFVO0FBQ3RDLGFBQU8sUUFBUDtBQUNEOzs7a0RBQzZCLFEsRUFBVTtBQUN0QyxhQUFPLFFBQVA7QUFDRDs7Ozs7O2tCQTNVa0IsWSIsImZpbGUiOiJ0ZXJtLWV4cGFuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyIGZyb20gXCIuL2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciwge01vbm9pZGFsUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1FeHBhbmRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfNzQxKSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF83NDE7XG4gIH1cbiAgZXhwYW5kKHRlcm1fNzQyKSB7XG4gICAgbGV0IGZpZWxkXzc0MyA9IFwiZXhwYW5kXCIgKyB0ZXJtXzc0Mi50eXBlO1xuICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF83NDNdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzc0M10odGVybV83NDIpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwiZXhwYW5kIG5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIHRlcm1fNzQyLnR5cGUpO1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzc0NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzc0NC50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc0NC50YWcpLCBlbGVtZW50czogdGVybV83NDQuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV83NDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzQ1LmxhYmVsID8gdGVybV83NDUubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzc0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzQ2LmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Ni50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV83NDcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Ny5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Ny5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV83NDgpIHtcbiAgICByZXR1cm4gdGVybV83NDg7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV83NDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzQ5LmxhYmVsID8gdGVybV83NDkubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV83NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzc1MC5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fNzUwLnByZURlZmF1bHRDYXNlcy5tYXAoY183NTEgPT4gdGhpcy5leHBhbmQoY183NTEpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzc1MC5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fNzUwLnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfNzUyID0+IHRoaXMuZXhwYW5kKGNfNzUyKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fNzUzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzUzLm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzUzLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fNzU0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzU0LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzc1NC5jYXNlcy5tYXAoY183NTUgPT4gdGhpcy5leHBhbmQoY183NTUpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fNzU2KSB7XG4gICAgbGV0IHJlc3RfNzU3ID0gdGVybV83NTYucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzU2LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzc1Ni5pdGVtcy5tYXAoaV83NTggPT4gdGhpcy5leHBhbmQoaV83NTgpKSwgcmVzdDogcmVzdF83NTd9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV83NTkpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fNzU5LCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fNzYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV83NjAuY29uc2VxdWVudC5tYXAoY183NjEgPT4gdGhpcy5leHBhbmQoY183NjEpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fNzYyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83NjIudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fNzYyLmNvbnNlcXVlbnQubWFwKGNfNzYzID0+IHRoaXMuZXhwYW5kKGNfNzYzKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV83NjQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV83NjQubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzc2NC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzY0LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV83NjUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83NjUuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzc2NS5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fNzY2KSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzc2NyA9IHRlcm1fNzY2LmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjYuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzY2LmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfNzY3LCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fNzY2LmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzc2OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc2OC5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NjguYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzc2OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc2OS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fNzcwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzcwLmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV83NzAucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc3MC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fNzcxKSB7XG4gICAgcmV0dXJuIHRlcm1fNzcxO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV83NzIpIHtcbiAgICByZXR1cm4gdGVybV83NzI7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV83NzMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV83NzMubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzczLmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV83NzQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NzQuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fNzc1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV83NzUucHJvcGVydGllcy5tYXAodF83NzYgPT4gdGhpcy5leHBhbmQodF83NzYpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV83NzcpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfNzc4ID0gdGVybV83NzcucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3Ny5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV83NzcuZWxlbWVudHMubWFwKHRfNzc5ID0+IHRfNzc5ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF83NzkpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF83Nzh9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV83ODApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzgwLmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzc4MC5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fNzgxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fNzgxLm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV83ODEubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fNzgyKSB7XG4gICAgbGV0IGluaXRfNzgzID0gdGVybV83ODIuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzgyLmluaXQpO1xuICAgIGxldCB0ZXN0Xzc4NCA9IHRlcm1fNzgyLnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4Mi50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzc4NSA9IHRlcm1fNzgyLnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzgyLnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfNzg2ID0gdGhpcy5leHBhbmQodGVybV83ODIuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzc4MywgdGVzdDogdGVzdF83ODQsIHVwZGF0ZTogdXBkYXRlXzc4NSwgYm9keTogYm9keV83ODZ9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV83ODcpIHtcbiAgICBsZXQgZXhwcl83ODggPSB0ZXJtXzc4Ny5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODcuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzc4OH0pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzc4OSkge1xuICAgIGxldCBleHByXzc5MCA9IHRlcm1fNzg5LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4OS5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfNzkwfSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV83OTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83OTEudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzkxLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV83OTIpIHtcbiAgICBsZXQgY29uc2VxdWVudF83OTMgPSB0ZXJtXzc5Mi5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83OTIuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV83OTQgPSB0ZXJtXzc5Mi5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc5Mi5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc5Mi50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF83OTMsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzc5NH0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fNzk1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzc5NS5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzc5Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzc5Ni5zdGF0ZW1lbnRzLm1hcChzXzc5NyA9PiB0aGlzLmV4cGFuZChzXzc5NykpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV83OTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV83OTguZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fNzk5KSB7XG4gICAgaWYgKHRlcm1fNzk5LmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fNzk5O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzk5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzgwMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fODAwLm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzgwMC5uYW1lKSwgc3VwZXI6IHRlcm1fODAwLnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV84MDAuc3VwZXIpLCBlbGVtZW50czogdGVybV84MDAuZWxlbWVudHMubWFwKGVsXzgwMSA9PiB0aGlzLmV4cGFuZChlbF84MDEpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV84MDIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fODAyLm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzgwMi5uYW1lKSwgc3VwZXI6IHRlcm1fODAyLnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV84MDIuc3VwZXIpLCBlbGVtZW50czogdGVybV84MDIuZWxlbWVudHMubWFwKGVsXzgwMyA9PiB0aGlzLmV4cGFuZChlbF84MDMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV84MDQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzgwNC5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzgwNC5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV84MDUpIHtcbiAgICByZXR1cm4gdGVybV84MDU7XG4gIH1cbiAgZXhwYW5kU3ludGF4VGVtcGxhdGUodGVybV84MDYpIHtcbiAgICBsZXQgZXhwYW5kZXJfODA3ID0gbmV3IEV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJfODA4ID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fODA2LnRlbXBsYXRlLmlubmVyKCkpO1xuICAgIGxldCBzdHJfODA5ID0gU3ludGF4LmZyb21TdHJpbmcoc2VyaWFsaXplci53cml0ZShyXzgwOC50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfODEwID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwic3ludGF4VGVtcGxhdGVcIil9KTtcbiAgICBsZXQgZXhwYW5kZWRJbnRlcnBzXzgxMSA9IHJfODA4LmludGVycC5tYXAoaV84MTMgPT4ge1xuICAgICAgbGV0IGVuZl84MTQgPSBuZXcgRW5mb3Jlc3RlcihpXzgxMywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl84MTQuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpKTtcbiAgICB9KTtcbiAgICBsZXQgYXJnc184MTIgPSBMaXN0Lm9mKG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBzdHJfODA5fSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfODExKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODEwLCBhcmd1bWVudHM6IGFyZ3NfODEyfSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV84MTUpIHtcbiAgICBsZXQgc3RyXzgxNiA9IG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBTeW50YXguZnJvbVN0cmluZyhzZXJpYWxpemVyLndyaXRlKHRlcm1fODE1Lm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzgxNS50ZW1wbGF0ZS50YWcsIGVsZW1lbnRzOiB0ZXJtXzgxNS50ZW1wbGF0ZS5lbGVtZW50cy5wdXNoKHN0cl84MTYpLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV84MTcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fODE3Lm9iamVjdCksIHByb3BlcnR5OiB0ZXJtXzgxNy5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzgxOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHRlcm1fODE4LmVsZW1lbnRzLm1hcCh0XzgxOSA9PiB0XzgxOSA9PSBudWxsID8gdF84MTkgOiB0aGlzLmV4cGFuZCh0XzgxOSkpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fODIwKSB7XG4gICAgcmV0dXJuIHRlcm1fODIwO1xuICB9XG4gIGV4cGFuZEltcG9ydE5hbWVzcGFjZSh0ZXJtXzgyMSkge1xuICAgIHJldHVybiB0ZXJtXzgyMTtcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV84MjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMi5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fODIzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV84MjMuYm9keSl9KTtcbiAgfVxuICBleHBhbmRFeHBvcnRGcm9tKHRlcm1fODI0KSB7XG4gICAgcmV0dXJuIHRlcm1fODI0O1xuICB9XG4gIGV4cGFuZEV4cG9ydEFsbEZyb20odGVybV84MjUpIHtcbiAgICByZXR1cm4gdGVybV84MjU7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fODI2KSB7XG4gICAgcmV0dXJuIHRlcm1fODI2O1xuICB9XG4gIGV4cGFuZFN0YXRpY1Byb3BlcnR5TmFtZSh0ZXJtXzgyNykge1xuICAgIHJldHVybiB0ZXJtXzgyNztcbiAgfVxuICBleHBhbmREYXRhUHJvcGVydHkodGVybV84MjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODI4Lm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgyOC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEV4cHJlc3Npb24odGVybV84MjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzgyOS5wcm9wZXJ0aWVzLm1hcCh0XzgzMCA9PiB0aGlzLmV4cGFuZCh0XzgzMCkpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdG9yKHRlcm1fODMxKSB7XG4gICAgbGV0IGluaXRfODMyID0gdGVybV84MzEuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fODMxLmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84MzEuYmluZGluZyksIGluaXQ6IGluaXRfODMyfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtXzgzMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHRlcm1fODMzLmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzgzMy5kZWNsYXJhdG9ycy5tYXAoZF84MzQgPT4gdGhpcy5leHBhbmQoZF84MzQpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fODM1KSB7XG4gICAgaWYgKHRlcm1fODM1LmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzgzNiA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODM1LmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF84MzcgPSBlbmZfODM2LnBlZWsoKTtcbiAgICBsZXQgdF84MzggPSBlbmZfODM2LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzgzOCA9PSBudWxsIHx8IGVuZl84MzYucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzgzNi5jcmVhdGVFcnJvcihsb29rYWhlYWRfODM3LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF84MzgpO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzgzOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fODM5Lm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzgzOS5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV84NDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV84NDAuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzg0MC5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV84NDAub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fODQxKSB7XG4gICAgbGV0IGxlZnRfODQyID0gdGhpcy5leHBhbmQodGVybV84NDEubGVmdCk7XG4gICAgbGV0IHJpZ2h0Xzg0MyA9IHRoaXMuZXhwYW5kKHRlcm1fODQxLnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0Xzg0Miwgb3BlcmF0b3I6IHRlcm1fODQxLm9wZXJhdG9yLCByaWdodDogcmlnaHRfODQzfSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fODQ0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzg0NC50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV84NDQuY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV84NDQuYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV84NDUpIHtcbiAgICByZXR1cm4gdGVybV84NDU7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzg0Nikge1xuICAgIGxldCBjYWxsZWVfODQ3ID0gdGhpcy5leHBhbmQodGVybV84NDYuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzg0OCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODQ2LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzg0OSA9IGVuZl84NDguZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzg1MCA9PiB0aGlzLmV4cGFuZChhcmdfODUwKSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODQ3LCBhcmd1bWVudHM6IGFyZ3NfODQ5LnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fODUxKSB7XG4gICAgcmV0dXJuIHRlcm1fODUxO1xuICB9XG4gIGV4cGFuZENhbGxFeHByZXNzaW9uKHRlcm1fODUyKSB7XG4gICAgbGV0IGNhbGxlZV84NTMgPSB0aGlzLmV4cGFuZCh0ZXJtXzg1Mi5jYWxsZWUpO1xuICAgIGxldCBlbmZfODU0ID0gbmV3IEVuZm9yZXN0ZXIodGVybV84NTIuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfODU1ID0gZW5mXzg1NC5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfODU2ID0+IHRoaXMuZXhwYW5kKGFyZ184NTYpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODUzLCBhcmd1bWVudHM6IGFyZ3NfODU1fSk7XG4gIH1cbiAgZXhwYW5kU3ByZWFkRWxlbWVudCh0ZXJtXzg1Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODU3LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzg1OCkge1xuICAgIGxldCBjaGlsZF84NTkgPSB0aGlzLmV4cGFuZCh0ZXJtXzg1OC5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF84NTl9KTtcbiAgfVxuICBleHBhbmRMYWJlbGVkU3RhdGVtZW50KHRlcm1fODYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fODYwLmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzg2MC5ib2R5KX0pO1xuICB9XG4gIGRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NjEsIHR5cGVfODYyKSB7XG4gICAgbGV0IHNjb3BlXzg2MyA9IGZyZXNoU2NvcGUoXCJmdW5cIik7XG4gICAgbGV0IHJlZF84NjQgPSBuZXcgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlcihzY29wZV84NjMsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc184NjU7XG4gICAgaWYgKHR5cGVfODYyICE9PSBcIkdldHRlclwiICYmIHR5cGVfODYyICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfODY1ID0gcmVkXzg2NC50cmFuc2Zvcm0odGVybV84NjEucGFyYW1zKTtcbiAgICAgIHBhcmFtc184NjUgPSB0aGlzLmV4cGFuZChwYXJhbXNfODY1KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzg2Myk7XG4gICAgbGV0IGV4cGFuZGVyXzg2NiA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5Xzg2NywgYm9keVRlcm1fODY4O1xuICAgIGlmICh0ZXJtXzg2MS5ib2R5IGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgYm9keVRlcm1fODY4ID0gdGhpcy5leHBhbmQodGVybV84NjEuYm9keS5hZGRTY29wZShzY29wZV84NjMsIHRoaXMuY29udGV4dC5iaW5kaW5ncykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5Xzg2NyA9IHRlcm1fODYxLmJvZHkubWFwKGJfODY5ID0+IGJfODY5LmFkZFNjb3BlKHNjb3BlXzg2MywgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgICBib2R5VGVybV84NjggPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBleHBhbmRlcl84NjYuZXhwYW5kKG1hcmtlZEJvZHlfODY3KX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzg2MiA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODYyLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV84NjEubmFtZSksIGJvZHk6IGJvZHlUZXJtXzg2OH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZV84NjIgPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg2Miwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODYxLm5hbWUpLCBwYXJhbTogdGVybV84NjEucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzg2OH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NjIsIHtuYW1lOiB0ZXJtXzg2MS5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV84NjEuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzg2NSwgYm9keTogYm9keVRlcm1fODY4fSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fODcwKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg3MCwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fODcxKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg3MSwgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fODcyKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg3MiwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzg3Mykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NzMsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV84NzQpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODc0LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fODc1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84NzUuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzg3NS5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NzUuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzg3Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzg3Ni5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NzYuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzg3Nykge1xuICAgIHJldHVybiB0ZXJtXzg3NztcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV84NzgpIHtcbiAgICByZXR1cm4gdGVybV84Nzg7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fODc5KSB7XG4gICAgcmV0dXJuIHRlcm1fODc5O1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV84ODApIHtcbiAgICByZXR1cm4gdGVybV84ODA7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV84ODEpIHtcbiAgICBsZXQgdHJhbnNfODgyID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV84ODEubmFtZS5yZXNvbHZlKCkpO1xuICAgIGlmICh0cmFuc184ODIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc184ODIuaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fODgxO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzg4Mykge1xuICAgIHJldHVybiB0ZXJtXzg4MztcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzg4NCkge1xuICAgIHJldHVybiB0ZXJtXzg4NDtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzg4NSkge1xuICAgIHJldHVybiB0ZXJtXzg4NTtcbiAgfVxufVxuIl19