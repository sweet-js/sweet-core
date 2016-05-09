"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var TermExpander = (function () {
  function TermExpander(context_733) {
    _classCallCheck(this, TermExpander);

    this.context = context_733;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_734) {
      var field_735 = "expand" + term_734.type;
      if (typeof this[field_735] === "function") {
        return this[field_735](term_734);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_734.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_736) {
      return new _terms2.default("TemplateExpression", { tag: term_736.tag == null ? null : this.expand(term_736.tag), elements: term_736.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_737) {
      return new _terms2.default("BreakStatement", { label: term_737.label ? term_737.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_738) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_738.body), test: this.expand(term_738.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_739) {
      return new _terms2.default("WithStatement", { body: this.expand(term_739.body), object: this.expand(term_739.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_740) {
      return term_740;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_741) {
      return new _terms2.default("ContinueStatement", { label: term_741.label ? term_741.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_742) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_742.discriminant), preDefaultCases: term_742.preDefaultCases.map(function (c_743) {
          return _this.expand(c_743);
        }).toArray(), defaultCase: this.expand(term_742.defaultCase), postDefaultCases: term_742.postDefaultCases.map(function (c_744) {
          return _this.expand(c_744);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_745) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_745.object), expression: this.expand(term_745.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_746) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_746.discriminant), cases: term_746.cases.map(function (c_747) {
          return _this2.expand(c_747);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_748) {
      var _this3 = this;

      var rest_749 = term_748.rest == null ? null : this.expand(term_748.rest);
      return new _terms2.default("FormalParameters", { items: term_748.items.map(function (i_750) {
          return _this3.expand(i_750);
        }), rest: rest_749 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_751) {
      return this.doFunctionExpansion(term_751, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_752) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_752.consequent.map(function (c_753) {
          return _this4.expand(c_753);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_754) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_754.test), consequent: term_754.consequent.map(function (c_755) {
          return _this5.expand(c_755);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_756) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_756.left), right: this.expand(term_756.right), body: this.expand(term_756.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_757) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_757.body), catchClause: this.expand(term_757.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_758) {
      var catchClause_759 = term_758.catchClause == null ? null : this.expand(term_758.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_758.body), catchClause: catchClause_759, finalizer: this.expand(term_758.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_760) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_760.binding), body: this.expand(term_760.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_761) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_761.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_762) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_762.left), right: this.expand(term_762.right), body: this.expand(term_762.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_763) {
      return term_763;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_764) {
      return term_764;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_765) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_765.name), binding: this.expand(term_765.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_766) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_766.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_767) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_767.properties.map(function (t_768) {
          return _this6.expand(t_768);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_769) {
      var _this7 = this;

      var restElement_770 = term_769.restElement == null ? null : this.expand(term_769.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_769.elements.map(function (t_771) {
          return t_771 == null ? null : _this7.expand(t_771);
        }).toArray(), restElement: restElement_770 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_772) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_772.binding), init: this.expand(term_772.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_773) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_773.name }), expression: new _terms2.default("IdentifierExpression", { name: term_773.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_774) {
      var init_775 = term_774.init == null ? null : this.expand(term_774.init);
      var test_776 = term_774.test == null ? null : this.expand(term_774.test);
      var update_777 = term_774.update == null ? null : this.expand(term_774.update);
      var body_778 = this.expand(term_774.body);
      return new _terms2.default("ForStatement", { init: init_775, test: test_776, update: update_777, body: body_778 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_779) {
      var expr_780 = term_779.expression == null ? null : this.expand(term_779.expression);
      return new _terms2.default("YieldExpression", { expression: expr_780 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_781) {
      var expr_782 = term_781.expression == null ? null : this.expand(term_781.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_782 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_783) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_783.test), body: this.expand(term_783.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_784) {
      var consequent_785 = term_784.consequent == null ? null : this.expand(term_784.consequent);
      var alternate_786 = term_784.alternate == null ? null : this.expand(term_784.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_784.test), consequent: consequent_785, alternate: alternate_786 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_787) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_787.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_788) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_788.statements.map(function (s_789) {
          return _this8.expand(s_789);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_790) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_790.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_791) {
      if (term_791.expression == null) {
        return term_791;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_791.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_792) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_792.name == null ? null : this.expand(term_792.name), super: term_792.super == null ? null : this.expand(term_792.super), elements: term_792.elements.map(function (el_793) {
          return _this9.expand(el_793);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_794) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_794.name == null ? null : this.expand(term_794.name), super: term_794.super == null ? null : this.expand(term_794.super), elements: term_794.elements.map(function (el_795) {
          return _this10.expand(el_795);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_796) {
      return new _terms2.default("ClassElement", { isStatic: term_796.isStatic, method: this.expand(term_796.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_797) {
      return term_797;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_798) {
      var _this11 = this;

      var expander_799 = new _expander2.default(this.context);
      var r_800 = (0, _templateProcessor.processTemplate)(term_798.template.inner());
      var str_801 = _syntax2.default.fromString(_serializer.serializer.write(r_800.template));
      var callee_802 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_803 = r_800.interp.map(function (i_805) {
        var enf_806 = new _enforester.Enforester(i_805, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_806.enforest("expression"));
      });
      var args_804 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_801 })).concat(expandedInterps_803);
      return new _terms2.default("CallExpression", { callee: callee_802, arguments: args_804 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_807) {
      var str_808 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_807.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_807.template.tag, elements: term_807.template.elements.push(str_808).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_809) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_809.object), property: term_809.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_810) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_810.elements.map(function (t_811) {
          return t_811 == null ? t_811 : _this12.expand(t_811);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_812) {
      return term_812;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_813) {
      return term_813;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_814) {
      return new _terms2.default("Export", { declaration: this.expand(term_814.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_815) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_815.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_816) {
      return term_816;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_817) {
      return term_817;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_818) {
      return term_818;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_819) {
      return term_819;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_820) {
      return new _terms2.default("DataProperty", { name: this.expand(term_820.name), expression: this.expand(term_820.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_821) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_821.properties.map(function (t_822) {
          return _this13.expand(t_822);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_823) {
      var init_824 = term_823.init == null ? null : this.expand(term_823.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_823.binding), init: init_824 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_825) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_825.kind, declarators: term_825.declarators.map(function (d_826) {
          return _this14.expand(d_826);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_827) {
      if (term_827.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_828 = new _enforester.Enforester(term_827.inner, (0, _immutable.List)(), this.context);
      var lookahead_829 = enf_828.peek();
      var t_830 = enf_828.enforestExpression();
      if (t_830 == null || enf_828.rest.size > 0) {
        throw enf_828.createError(lookahead_829, "unexpected syntax");
      }
      return this.expand(t_830);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_831) {
      return new _terms2.default("UnaryExpression", { operator: term_831.operator, operand: this.expand(term_831.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_832) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_832.isPrefix, operator: term_832.operator, operand: this.expand(term_832.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_833) {
      var left_834 = this.expand(term_833.left);
      var right_835 = this.expand(term_833.right);
      return new _terms2.default("BinaryExpression", { left: left_834, operator: term_833.operator, right: right_835 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_836) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_836.test), consequent: this.expand(term_836.consequent), alternate: this.expand(term_836.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_837) {
      return term_837;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_838) {
      var _this15 = this;

      var callee_839 = this.expand(term_838.callee);
      var enf_840 = new _enforester.Enforester(term_838.arguments, (0, _immutable.List)(), this.context);
      var args_841 = enf_840.enforestArgumentList().map(function (arg_842) {
        return _this15.expand(arg_842);
      });
      return new _terms2.default("NewExpression", { callee: callee_839, arguments: args_841.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_843) {
      return term_843;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_844) {
      var _this16 = this;

      var callee_845 = this.expand(term_844.callee);
      var enf_846 = new _enforester.Enforester(term_844.arguments, (0, _immutable.List)(), this.context);
      var args_847 = enf_846.enforestArgumentList().map(function (arg_848) {
        return _this16.expand(arg_848);
      });
      return new _terms2.default("CallExpression", { callee: callee_845, arguments: args_847 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_849) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_849.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_850) {
      var child_851 = this.expand(term_850.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_851 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_852) {
      return new _terms2.default("LabeledStatement", { label: term_852.label.val(), body: this.expand(term_852.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_853, type_854) {
      var _this17 = this;

      var scope_855 = (0, _scope.freshScope)("fun");
      var red_856 = new _applyScopeInParamsReducer2.default(scope_855, this.context);
      var params_857 = undefined;
      if (type_854 !== "Getter" && type_854 !== "Setter") {
        params_857 = red_856.transform(term_853.params);
        params_857 = this.expand(params_857);
      }
      this.context.currentScope.push(scope_855);
      var expander_858 = new _expander2.default(this.context);
      var markedBody_859 = undefined,
          bodyTerm_860 = undefined;
      if (term_853.body instanceof _terms2.default) {
        bodyTerm_860 = this.expand(term_853.body.addScope(scope_855, this.context.bindings));
      } else {
        markedBody_859 = term_853.body.map(function (b_861) {
          return b_861.addScope(scope_855, _this17.context.bindings);
        });
        bodyTerm_860 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_858.expand(markedBody_859) });
      }
      this.context.currentScope.pop();
      if (type_854 === "Getter") {
        return new _terms2.default(type_854, { name: this.expand(term_853.name), body: bodyTerm_860 });
      } else if (type_854 === "Setter") {
        return new _terms2.default(type_854, { name: this.expand(term_853.name), param: term_853.param, body: bodyTerm_860 });
      }
      return new _terms2.default(type_854, { name: term_853.name, isGenerator: term_853.isGenerator, params: params_857, body: bodyTerm_860 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_862) {
      return this.doFunctionExpansion(term_862, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_863) {
      return this.doFunctionExpansion(term_863, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_864) {
      return this.doFunctionExpansion(term_864, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_865) {
      return this.doFunctionExpansion(term_865, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_866) {
      return this.doFunctionExpansion(term_866, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_867) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_867.binding), operator: term_867.operator, expression: this.expand(term_867.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_868) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_868.binding), expression: this.expand(term_868.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_869) {
      return term_869;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_870) {
      return term_870;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_871) {
      return term_871;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_872) {
      return term_872;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_873) {
      var trans_874 = this.context.env.get(term_873.name.resolve());
      if (trans_874) {
        return new _terms2.default("IdentifierExpression", { name: trans_874.id });
      }
      return term_873;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_875) {
      return term_875;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_876) {
      return term_876;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_877) {
      return term_877;
    }
  }]);

  return TermExpander;
})();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFXcUIsWUFBWTtBQUMvQixXQURtQixZQUFZLENBQ25CLFdBQVcsRUFBRTswQkFETixZQUFZOztBQUU3QixRQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztHQUM1Qjs7ZUFIa0IsWUFBWTs7MkJBSXhCLFFBQVEsRUFBRTtBQUNmLFVBQUksU0FBUyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ3pDLFVBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3pDLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2xDO0FBQ0QsMEJBQU8sS0FBSyxFQUFFLGtDQUFrQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuRTs7OzZDQUN3QixRQUFRLEVBQUU7QUFDakMsYUFBTyxvQkFBUyxvQkFBb0IsRUFBRSxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQzlJOzs7eUNBQ29CLFFBQVEsRUFBRTtBQUM3QixhQUFPLG9CQUFTLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7MkNBQ3NCLFFBQVEsRUFBRTtBQUMvQixhQUFPLG9CQUFTLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFN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QVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNqSTs7O3lDQUNvQixRQUFRLEVBQUU7QUFDN0IsYUFBTyxRQUFRLENBQUM7S0FDakI7OzttREFDOEIsUUFBUSxFQUFFO0FBQ3ZDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7bURBQzhCLFFBQVEsRUFBRTtBQUN2QyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O29EQUMrQixRQUFRLEVBQUU7QUFDeEMsYUFBTyxRQUFRLENBQUM7S0FDakI7OzsrQ0FDMEIsUUFBUSxFQUFFO0FBQ25DLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDOUQsVUFBSSxTQUFTLEVBQUU7QUFDYixlQUFPLG9CQUFTLHNCQUFzQixFQUFFLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsYUFBTyxRQUFRLENBQUM7S0FDakI7OztnREFDMkIsUUFBUSxFQUFFO0FBQ3BDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7a0RBQzZCLFFBQVEsRUFBRTtBQUN0QyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O2tEQUM2QixRQUFRLEVBQUU7QUFDdEMsYUFBTyxRQUFRLENBQUM7S0FDakI7OztTQTNVa0IsWUFBWTs7O2tCQUFaLFlBQVkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQge3NlcmlhbGl6ZXIsIG1ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge3Byb2Nlc3NUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzczMykge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfNzMzO1xuICB9XG4gIGV4cGFuZCh0ZXJtXzczNCkge1xuICAgIGxldCBmaWVsZF83MzUgPSBcImV4cGFuZFwiICsgdGVybV83MzQudHlwZTtcbiAgICBpZiAodHlwZW9mIHRoaXNbZmllbGRfNzM1XSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gdGhpc1tmaWVsZF83MzVdKHRlcm1fNzM0KTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcImV4cGFuZCBub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyB0ZXJtXzczNC50eXBlKTtcbiAgfVxuICBleHBhbmRUZW1wbGF0ZUV4cHJlc3Npb24odGVybV83MzYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV83MzYudGFnID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83MzYudGFnKSwgZWxlbWVudHM6IHRlcm1fNzM2LmVsZW1lbnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEJyZWFrU3RhdGVtZW50KHRlcm1fNzM3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzczNy5sYWJlbCA/IHRlcm1fNzM3LmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZERvV2hpbGVTdGF0ZW1lbnQodGVybV83MzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzczOC5ib2R5KSwgdGVzdDogdGhpcy5leHBhbmQodGVybV83MzgudGVzdCl9KTtcbiAgfVxuICBleHBhbmRXaXRoU3RhdGVtZW50KHRlcm1fNzM5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83MzkuYm9keSksIG9iamVjdDogdGhpcy5leHBhbmQodGVybV83Mzkub2JqZWN0KX0pO1xuICB9XG4gIGV4cGFuZERlYnVnZ2VyU3RhdGVtZW50KHRlcm1fNzQwKSB7XG4gICAgcmV0dXJuIHRlcm1fNzQwO1xuICB9XG4gIGV4cGFuZENvbnRpbnVlU3RhdGVtZW50KHRlcm1fNzQxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzc0MS5sYWJlbCA/IHRlcm1fNzQxLmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0KHRlcm1fNzQyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV83NDIuZGlzY3JpbWluYW50KSwgcHJlRGVmYXVsdENhc2VzOiB0ZXJtXzc0Mi5wcmVEZWZhdWx0Q2FzZXMubWFwKGNfNzQzID0+IHRoaXMuZXhwYW5kKGNfNzQzKSkudG9BcnJheSgpLCBkZWZhdWx0Q2FzZTogdGhpcy5leHBhbmQodGVybV83NDIuZGVmYXVsdENhc2UpLCBwb3N0RGVmYXVsdENhc2VzOiB0ZXJtXzc0Mi5wb3N0RGVmYXVsdENhc2VzLm1hcChjXzc0NCA9PiB0aGlzLmV4cGFuZChjXzc0NCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzc0NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0NS5vYmplY3QpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc0NS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudCh0ZXJtXzc0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Ni5kaXNjcmltaW5hbnQpLCBjYXNlczogdGVybV83NDYuY2FzZXMubWFwKGNfNzQ3ID0+IHRoaXMuZXhwYW5kKGNfNzQ3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ybWFsUGFyYW1ldGVycyh0ZXJtXzc0OCkge1xuICAgIGxldCByZXN0Xzc0OSA9IHRlcm1fNzQ4LnJlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc0OC5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogdGVybV83NDguaXRlbXMubWFwKGlfNzUwID0+IHRoaXMuZXhwYW5kKGlfNzUwKSksIHJlc3Q6IHJlc3RfNzQ5fSk7XG4gIH1cbiAgZXhwYW5kQXJyb3dFeHByZXNzaW9uKHRlcm1fNzUxKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzc1MSwgXCJBcnJvd0V4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtXzc1Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRlcm1fNzUyLmNvbnNlcXVlbnQubWFwKGNfNzUzID0+IHRoaXMuZXhwYW5kKGNfNzUzKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoQ2FzZSh0ZXJtXzc1NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzU0LnRlc3QpLCBjb25zZXF1ZW50OiB0ZXJtXzc1NC5jb25zZXF1ZW50Lm1hcChjXzc1NSA9PiB0aGlzLmV4cGFuZChjXzc1NSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEZvckluU3RhdGVtZW50KHRlcm1fNzU2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ySW5TdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzU2LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV83NTYucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc1Ni5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZFRyeUNhdGNoU3RhdGVtZW50KHRlcm1fNzU3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5Q2F0Y2hTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzU3LmJvZHkpLCBjYXRjaENsYXVzZTogdGhpcy5leHBhbmQodGVybV83NTcuY2F0Y2hDbGF1c2UpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5RmluYWxseVN0YXRlbWVudCh0ZXJtXzc1OCkge1xuICAgIGxldCBjYXRjaENsYXVzZV83NTkgPSB0ZXJtXzc1OC5jYXRjaENsYXVzZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzU4LmNhdGNoQ2xhdXNlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc1OC5ib2R5KSwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlXzc1OSwgZmluYWxpemVyOiB0aGlzLmV4cGFuZCh0ZXJtXzc1OC5maW5hbGl6ZXIpfSk7XG4gIH1cbiAgZXhwYW5kQ2F0Y2hDbGF1c2UodGVybV83NjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV83NjAuYmluZGluZyksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzYwLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVGhyb3dTdGF0ZW1lbnQodGVybV83NjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NjEuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRGb3JPZlN0YXRlbWVudCh0ZXJtXzc2Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvck9mU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzc2Mi5sZWZ0KSwgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm1fNzYyLnJpZ2h0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NjIuYm9keSl9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nSWRlbnRpZmllcih0ZXJtXzc2Mykge1xuICAgIHJldHVybiB0ZXJtXzc2MztcbiAgfVxuICBleHBhbmRCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyKHRlcm1fNzY0KSB7XG4gICAgcmV0dXJuIHRlcm1fNzY0O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5KHRlcm1fNzY1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fNzY1Lm5hbWUpLCBiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc2NS5iaW5kaW5nKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkUHJvcGVydHlOYW1lKHRlcm1fNzY2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzY2LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0QmluZGluZyh0ZXJtXzc2Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fNzY3LnByb3BlcnRpZXMubWFwKHRfNzY4ID0+IHRoaXMuZXhwYW5kKHRfNzY4KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm1fNzY5KSB7XG4gICAgbGV0IHJlc3RFbGVtZW50Xzc3MCA9IHRlcm1fNzY5LnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjkucmVzdEVsZW1lbnQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fNzY5LmVsZW1lbnRzLm1hcCh0Xzc3MSA9PiB0Xzc3MSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRfNzcxKSkudG9BcnJheSgpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfNzcwfSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1dpdGhEZWZhdWx0KHRlcm1fNzcyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc3Mi5iaW5kaW5nKSwgaW5pdDogdGhpcy5leHBhbmQodGVybV83NzIuaW5pdCl9KTtcbiAgfVxuICBleHBhbmRTaG9ydGhhbmRQcm9wZXJ0eSh0ZXJtXzc3Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0ZXJtXzc3My5uYW1lfSksIGV4cHJlc3Npb246IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNzczLm5hbWV9KX0pO1xuICB9XG4gIGV4cGFuZEZvclN0YXRlbWVudCh0ZXJtXzc3NCkge1xuICAgIGxldCBpbml0Xzc3NSA9IHRlcm1fNzc0LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3NC5pbml0KTtcbiAgICBsZXQgdGVzdF83NzYgPSB0ZXJtXzc3NC50ZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzQudGVzdCk7XG4gICAgbGV0IHVwZGF0ZV83NzcgPSB0ZXJtXzc3NC51cGRhdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3NC51cGRhdGUpO1xuICAgIGxldCBib2R5Xzc3OCA9IHRoaXMuZXhwYW5kKHRlcm1fNzc0LmJvZHkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF83NzUsIHRlc3Q6IHRlc3RfNzc2LCB1cGRhdGU6IHVwZGF0ZV83NzcsIGJvZHk6IGJvZHlfNzc4fSk7XG4gIH1cbiAgZXhwYW5kWWllbGRFeHByZXNzaW9uKHRlcm1fNzc5KSB7XG4gICAgbGV0IGV4cHJfNzgwID0gdGVybV83NzkuZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzc5LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl83ODB9KTtcbiAgfVxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybV83ODEpIHtcbiAgICBsZXQgZXhwcl83ODIgPSB0ZXJtXzc4MS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODEuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzc4Mn0pO1xuICB9XG4gIGV4cGFuZFdoaWxlU3RhdGVtZW50KHRlcm1fNzgzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzgzLnRlc3QpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc4My5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZElmU3RhdGVtZW50KHRlcm1fNzg0KSB7XG4gICAgbGV0IGNvbnNlcXVlbnRfNzg1ID0gdGVybV83ODQuY29uc2VxdWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzg0LmNvbnNlcXVlbnQpO1xuICAgIGxldCBhbHRlcm5hdGVfNzg2ID0gdGVybV83ODQuYWx0ZXJuYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODQuYWx0ZXJuYXRlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83ODQudGVzdCksIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfNzg1LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV83ODZ9KTtcbiAgfVxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtXzc4Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5leHBhbmQodGVybV83ODcuYmxvY2spfSk7XG4gIH1cbiAgZXhwYW5kQmxvY2sodGVybV83ODgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogdGVybV83ODguc3RhdGVtZW50cy5tYXAoc183ODkgPT4gdGhpcy5leHBhbmQoc183ODkpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm1fNzkwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fNzkwLmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZFJldHVyblN0YXRlbWVudCh0ZXJtXzc5MSkge1xuICAgIGlmICh0ZXJtXzc5MS5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXJtXzc5MTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc5MS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRGVjbGFyYXRpb24odGVybV83OTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0RlY2xhcmF0aW9uXCIsIHtuYW1lOiB0ZXJtXzc5Mi5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83OTIubmFtZSksIHN1cGVyOiB0ZXJtXzc5Mi5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzkyLnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fNzkyLmVsZW1lbnRzLm1hcChlbF83OTMgPT4gdGhpcy5leHBhbmQoZWxfNzkzKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFeHByZXNzaW9uKHRlcm1fNzk0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFeHByZXNzaW9uXCIsIHtuYW1lOiB0ZXJtXzc5NC5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83OTQubmFtZSksIHN1cGVyOiB0ZXJtXzc5NC5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzk0LnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fNzk0LmVsZW1lbnRzLm1hcChlbF83OTUgPT4gdGhpcy5leHBhbmQoZWxfNzk1KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFbGVtZW50KHRlcm1fNzk2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogdGVybV83OTYuaXNTdGF0aWMsIG1ldGhvZDogdGhpcy5leHBhbmQodGVybV83OTYubWV0aG9kKX0pO1xuICB9XG4gIGV4cGFuZFRoaXNFeHByZXNzaW9uKHRlcm1fNzk3KSB7XG4gICAgcmV0dXJuIHRlcm1fNzk3O1xuICB9XG4gIGV4cGFuZFN5bnRheFRlbXBsYXRlKHRlcm1fNzk4KSB7XG4gICAgbGV0IGV4cGFuZGVyXzc5OSA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCByXzgwMCA9IHByb2Nlc3NUZW1wbGF0ZSh0ZXJtXzc5OC50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzgwMSA9IFN5bnRheC5mcm9tU3RyaW5nKHNlcmlhbGl6ZXIud3JpdGUocl84MDAudGVtcGxhdGUpKTtcbiAgICBsZXQgY2FsbGVlXzgwMiA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc184MDMgPSByXzgwMC5pbnRlcnAubWFwKGlfODA1ID0+IHtcbiAgICAgIGxldCBlbmZfODA2ID0gbmV3IEVuZm9yZXN0ZXIoaV84MDUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZChlbmZfODA2LmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKSk7XG4gICAgfSk7XG4gICAgbGV0IGFyZ3NfODA0ID0gTGlzdC5vZihuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogc3RyXzgwMX0pKS5jb25jYXQoZXhwYW5kZWRJbnRlcnBzXzgwMyk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzgwMiwgYXJndW1lbnRzOiBhcmdzXzgwNH0pO1xuICB9XG4gIGV4cGFuZFN5bnRheFF1b3RlKHRlcm1fODA3KSB7XG4gICAgbGV0IHN0cl84MDggPSBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogU3ludGF4LmZyb21TdHJpbmcoc2VyaWFsaXplci53cml0ZSh0ZXJtXzgwNy5uYW1lKSl9KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV84MDcudGVtcGxhdGUudGFnLCBlbGVtZW50czogdGVybV84MDcudGVtcGxhdGUuZWxlbWVudHMucHVzaChzdHJfODA4KS5wdXNoKG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogXCJcIn0pKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdGF0aWNNZW1iZXJFeHByZXNzaW9uKHRlcm1fODA5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzgwOS5vYmplY3QpLCBwcm9wZXJ0eTogdGVybV84MDkucHJvcGVydHl9KTtcbiAgfVxuICBleHBhbmRBcnJheUV4cHJlc3Npb24odGVybV84MTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiB0ZXJtXzgxMC5lbGVtZW50cy5tYXAodF84MTEgPT4gdF84MTEgPT0gbnVsbCA/IHRfODExIDogdGhpcy5leHBhbmQodF84MTEpKX0pO1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzgxMikge1xuICAgIHJldHVybiB0ZXJtXzgxMjtcbiAgfVxuICBleHBhbmRJbXBvcnROYW1lc3BhY2UodGVybV84MTMpIHtcbiAgICByZXR1cm4gdGVybV84MTM7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fODE0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV84MTQuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RGVmYXVsdCh0ZXJtXzgxNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fODE1LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtXzgxNikge1xuICAgIHJldHVybiB0ZXJtXzgxNjtcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fODE3KSB7XG4gICAgcmV0dXJuIHRlcm1fODE3O1xuICB9XG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtXzgxOCkge1xuICAgIHJldHVybiB0ZXJtXzgxODtcbiAgfVxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybV84MTkpIHtcbiAgICByZXR1cm4gdGVybV84MTk7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fODIwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMC5uYW1lKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84MjAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fODIxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogdGVybV84MjEucHJvcGVydGllcy5tYXAodF84MjIgPT4gdGhpcy5leHBhbmQodF84MjIpKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRvcih0ZXJtXzgyMykge1xuICAgIGxldCBpbml0XzgyNCA9IHRlcm1fODIzLmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMy5pbml0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fODIzLmJpbmRpbmcpLCBpbml0OiBpbml0XzgyNH0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb24odGVybV84MjUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiB0ZXJtXzgyNS5raW5kLCBkZWNsYXJhdG9yczogdGVybV84MjUuZGVjbGFyYXRvcnMubWFwKGRfODI2ID0+IHRoaXMuZXhwYW5kKGRfODI2KSl9KTtcbiAgfVxuICBleHBhbmRQYXJlbnRoZXNpemVkRXhwcmVzc2lvbih0ZXJtXzgyNykge1xuICAgIGlmICh0ZXJtXzgyNy5pbm5lci5zaXplID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl84MjggPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzgyNy5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfODI5ID0gZW5mXzgyOC5wZWVrKCk7XG4gICAgbGV0IHRfODMwID0gZW5mXzgyOC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodF84MzAgPT0gbnVsbCB8fCBlbmZfODI4LnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZl84MjguY3JlYXRlRXJyb3IobG9va2FoZWFkXzgyOSwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kKHRfODMwKTtcbiAgfVxuICBleHBhbmRVbmFyeUV4cHJlc3Npb24odGVybV84MzEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVbmFyeUV4cHJlc3Npb25cIiwge29wZXJhdG9yOiB0ZXJtXzgzMS5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV84MzEub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRVcGRhdGVFeHByZXNzaW9uKHRlcm1fODMyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IHRlcm1fODMyLmlzUHJlZml4LCBvcGVyYXRvcjogdGVybV84MzIub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fODMyLm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kQmluYXJ5RXhwcmVzc2lvbih0ZXJtXzgzMykge1xuICAgIGxldCBsZWZ0XzgzNCA9IHRoaXMuZXhwYW5kKHRlcm1fODMzLmxlZnQpO1xuICAgIGxldCByaWdodF84MzUgPSB0aGlzLmV4cGFuZCh0ZXJtXzgzMy5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF84MzQsIG9wZXJhdG9yOiB0ZXJtXzgzMy5vcGVyYXRvciwgcmlnaHQ6IHJpZ2h0XzgzNX0pO1xuICB9XG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtXzgzNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV84MzYudGVzdCksIGNvbnNlcXVlbnQ6IHRoaXMuZXhwYW5kKHRlcm1fODM2LmNvbnNlcXVlbnQpLCBhbHRlcm5hdGU6IHRoaXMuZXhwYW5kKHRlcm1fODM2LmFsdGVybmF0ZSl9KTtcbiAgfVxuICBleHBhbmROZXdUYXJnZXRFeHByZXNzaW9uKHRlcm1fODM3KSB7XG4gICAgcmV0dXJuIHRlcm1fODM3O1xuICB9XG4gIGV4cGFuZE5ld0V4cHJlc3Npb24odGVybV84MzgpIHtcbiAgICBsZXQgY2FsbGVlXzgzOSA9IHRoaXMuZXhwYW5kKHRlcm1fODM4LmNhbGxlZSk7XG4gICAgbGV0IGVuZl84NDAgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzgzOC5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc184NDEgPSBlbmZfODQwLmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ184NDIgPT4gdGhpcy5leHBhbmQoYXJnXzg0MikpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzgzOSwgYXJndW1lbnRzOiBhcmdzXzg0MS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdXBlcih0ZXJtXzg0Mykge1xuICAgIHJldHVybiB0ZXJtXzg0MztcbiAgfVxuICBleHBhbmRDYWxsRXhwcmVzc2lvbih0ZXJtXzg0NCkge1xuICAgIGxldCBjYWxsZWVfODQ1ID0gdGhpcy5leHBhbmQodGVybV84NDQuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzg0NiA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODQ0LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzg0NyA9IGVuZl84NDYuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzg0OCA9PiB0aGlzLmV4cGFuZChhcmdfODQ4KSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzg0NSwgYXJndW1lbnRzOiBhcmdzXzg0N30pO1xuICB9XG4gIGV4cGFuZFNwcmVhZEVsZW1lbnQodGVybV84NDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzg0OS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cHJlc3Npb25TdGF0ZW1lbnQodGVybV84NTApIHtcbiAgICBsZXQgY2hpbGRfODUxID0gdGhpcy5leHBhbmQodGVybV84NTAuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogY2hpbGRfODUxfSk7XG4gIH1cbiAgZXhwYW5kTGFiZWxlZFN0YXRlbWVudCh0ZXJtXzg1Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxhYmVsZWRTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzg1Mi5sYWJlbC52YWwoKSwgYm9keTogdGhpcy5leHBhbmQodGVybV84NTIuYm9keSl9KTtcbiAgfVxuICBkb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODUzLCB0eXBlXzg1NCkge1xuICAgIGxldCBzY29wZV84NTUgPSBmcmVzaFNjb3BlKFwiZnVuXCIpO1xuICAgIGxldCByZWRfODU2ID0gbmV3IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIoc2NvcGVfODU1LCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwYXJhbXNfODU3O1xuICAgIGlmICh0eXBlXzg1NCAhPT0gXCJHZXR0ZXJcIiAmJiB0eXBlXzg1NCAhPT0gXCJTZXR0ZXJcIikge1xuICAgICAgcGFyYW1zXzg1NyA9IHJlZF84NTYudHJhbnNmb3JtKHRlcm1fODUzLnBhcmFtcyk7XG4gICAgICBwYXJhbXNfODU3ID0gdGhpcy5leHBhbmQocGFyYW1zXzg1Nyk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucHVzaChzY29wZV84NTUpO1xuICAgIGxldCBleHBhbmRlcl84NTggPSBuZXcgRXhwYW5kZXIodGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbWFya2VkQm9keV84NTksIGJvZHlUZXJtXzg2MDtcbiAgICBpZiAodGVybV84NTMuYm9keSBpbnN0YW5jZW9mIFRlcm0pIHtcbiAgICAgIGJvZHlUZXJtXzg2MCA9IHRoaXMuZXhwYW5kKHRlcm1fODUzLmJvZHkuYWRkU2NvcGUoc2NvcGVfODU1LCB0aGlzLmNvbnRleHQuYmluZGluZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya2VkQm9keV84NTkgPSB0ZXJtXzg1My5ib2R5Lm1hcChiXzg2MSA9PiBiXzg2MS5hZGRTY29wZShzY29wZV84NTUsIHRoaXMuY29udGV4dC5iaW5kaW5ncykpO1xuICAgICAgYm9keVRlcm1fODYwID0gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgc3RhdGVtZW50czogZXhwYW5kZXJfODU4LmV4cGFuZChtYXJrZWRCb2R5Xzg1OSl9KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wb3AoKTtcbiAgICBpZiAodHlwZV84NTQgPT09IFwiR2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg1NCwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODUzLm5hbWUpLCBib2R5OiBib2R5VGVybV84NjB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVfODU0ID09PSBcIlNldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NTQsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzg1My5uYW1lKSwgcGFyYW06IHRlcm1fODUzLnBhcmFtLCBib2R5OiBib2R5VGVybV84NjB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODU0LCB7bmFtZTogdGVybV84NTMubmFtZSwgaXNHZW5lcmF0b3I6IHRlcm1fODUzLmlzR2VuZXJhdG9yLCBwYXJhbXM6IHBhcmFtc184NTcsIGJvZHk6IGJvZHlUZXJtXzg2MH0pO1xuICB9XG4gIGV4cGFuZE1ldGhvZCh0ZXJtXzg2Mikge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NjIsIFwiTWV0aG9kXCIpO1xuICB9XG4gIGV4cGFuZFNldHRlcih0ZXJtXzg2Mykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NjMsIFwiU2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEdldHRlcih0ZXJtXzg2NCkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NjQsIFwiR2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV84NjUpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODY1LCBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25FeHByZXNzaW9uKHRlcm1fODY2KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg2NiwgXCJGdW5jdGlvbkV4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzg2Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fODY3LmJpbmRpbmcpLCBvcGVyYXRvcjogdGVybV84Njcub3BlcmF0b3IsIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODY3LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV84NjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84NjguYmluZGluZyksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODY4LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRW1wdHlTdGF0ZW1lbnQodGVybV84NjkpIHtcbiAgICByZXR1cm4gdGVybV84Njk7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uKHRlcm1fODcwKSB7XG4gICAgcmV0dXJuIHRlcm1fODcwO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdW1lcmljRXhwcmVzc2lvbih0ZXJtXzg3MSkge1xuICAgIHJldHVybiB0ZXJtXzg3MTtcbiAgfVxuICBleHBhbmRMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uKHRlcm1fODcyKSB7XG4gICAgcmV0dXJuIHRlcm1fODcyO1xuICB9XG4gIGV4cGFuZElkZW50aWZpZXJFeHByZXNzaW9uKHRlcm1fODczKSB7XG4gICAgbGV0IHRyYW5zXzg3NCA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fODczLm5hbWUucmVzb2x2ZSgpKTtcbiAgICBpZiAodHJhbnNfODc0KSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdHJhbnNfODc0LmlkfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtXzg3MztcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVsbEV4cHJlc3Npb24odGVybV84NzUpIHtcbiAgICByZXR1cm4gdGVybV84NzU7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24odGVybV84NzYpIHtcbiAgICByZXR1cm4gdGVybV84NzY7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24odGVybV84NzcpIHtcbiAgICByZXR1cm4gdGVybV84Nzc7XG4gIH1cbn1cbiJdfQ==