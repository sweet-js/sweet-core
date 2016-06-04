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
      var params_857 = void 0;
      if (type_854 !== "Getter" && type_854 !== "Setter") {
        params_857 = red_856.transform(term_853.params);
        params_857 = this.expand(params_857);
      }
      this.context.currentScope.push(scope_855);
      var expander_858 = new _expander2.default(this.context);
      var markedBody_859 = void 0,
          bodyTerm_860 = void 0;
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
}();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztJQUNxQixZO0FBQ25CLHdCQUFZLFdBQVosRUFBeUI7QUFBQTs7QUFDdkIsU0FBSyxPQUFMLEdBQWUsV0FBZjtBQUNEOzs7OzJCQUNNLFEsRUFBVTtBQUNmLFVBQUksWUFBWSxXQUFXLFNBQVMsSUFBcEM7QUFDQSxVQUFJLE9BQU8sS0FBSyxTQUFMLENBQVAsS0FBMkIsVUFBL0IsRUFBMkM7QUFDekMsZUFBTyxLQUFLLFNBQUwsRUFBZ0IsUUFBaEIsQ0FBUDtBQUNEO0FBQ0QsMEJBQU8sS0FBUCxFQUFjLHFDQUFxQyxTQUFTLElBQTVEO0FBQ0Q7Ozs2Q0FDd0IsUSxFQUFVO0FBQ2pDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDs7O3lDQUNvQixRLEVBQVU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sU0FBUyxLQUFULEdBQWlCLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBakIsR0FBd0MsSUFBaEQsRUFBM0IsQ0FBUDtBQUNEOzs7MkNBQ3NCLFEsRUFBVTtBQUMvQixhQUFPLG9CQUFTLGtCQUFULEVBQTZCLEVBQUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQVAsRUFBbUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQXpDLEVBQTdCLENBQVA7QUFDRDs7O3dDQUNtQixRLEVBQVU7QUFDNUIsYUFBTyxvQkFBUyxl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SyxNQUFMLENBQVksU0FBUyxVQUFyQixDQUFsRixFQUF6QyxDQUFQO0FBQ0Q7OzsrQ0FDMEIsUSxFQUFVO0FBQ25DLGFBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxTQUFTLEtBQUssTUFBTCxDQUFZLFNBQVMsT0FBckIsQ0FBVixFQUF5QyxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQVMsVUFBckIsQ0FBckQsRUFBakMsQ0FBUDtBQUNEOzs7eUNBQ29CLFEsRUFBVTtBQUM3QixhQUFPLFFBQVA7QUFDRDs7O21EQUM4QixRLEVBQVU7QUFDdkMsYUFBTyxRQUFQO0FBQ0Q7OzttREFDOEIsUSxFQUFVO0FBQ3ZDLGFBQU8sUUFBUDtBQUNEOzs7b0RBQytCLFEsRUFBVTtBQUN4QyxhQUFPLFFBQVA7QUFDRDs7OytDQUMwQixRLEVBQVU7QUFDbkMsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxJQUFULENBQWMsT0FBZCxFQUFyQixDQUFoQjtBQUNBLFVBQUksU0FBSixFQUFlO0FBQ2IsZUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sVUFBVSxFQUFqQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxhQUFPLFFBQVA7QUFDRDs7O2dEQUMyQixRLEVBQVU7QUFDcEMsYUFBTyxRQUFQO0FBQ0Q7OztrREFDNkIsUSxFQUFVO0FBQ3RDLGFBQU8sUUFBUDtBQUNEOzs7a0RBQzZCLFEsRUFBVTtBQUN0QyxhQUFPLFFBQVA7QUFDRDs7Ozs7O2tCQTNVa0IsWSIsImZpbGUiOiJ0ZXJtLWV4cGFuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyIGZyb20gXCIuL2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciwge01vbm9pZGFsUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1FeHBhbmRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfNzMzKSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF83MzM7XG4gIH1cbiAgZXhwYW5kKHRlcm1fNzM0KSB7XG4gICAgbGV0IGZpZWxkXzczNSA9IFwiZXhwYW5kXCIgKyB0ZXJtXzczNC50eXBlO1xuICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF83MzVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzczNV0odGVybV83MzQpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwiZXhwYW5kIG5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIHRlcm1fNzM0LnR5cGUpO1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzczNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzczNi50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzczNi50YWcpLCBlbGVtZW50czogdGVybV83MzYuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV83MzcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzM3LmxhYmVsID8gdGVybV83MzcubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzczOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzM4LmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzczOC50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV83MzkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzczOS5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzczOS5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV83NDApIHtcbiAgICByZXR1cm4gdGVybV83NDA7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV83NDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzQxLmxhYmVsID8gdGVybV83NDEubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV83NDIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Mi5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fNzQyLnByZURlZmF1bHRDYXNlcy5tYXAoY183NDMgPT4gdGhpcy5leHBhbmQoY183NDMpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzc0Mi5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fNzQyLnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfNzQ0ID0+IHRoaXMuZXhwYW5kKGNfNzQ0KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fNzQ1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzQ1Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzQ1LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fNzQ2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzQ2LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzc0Ni5jYXNlcy5tYXAoY183NDcgPT4gdGhpcy5leHBhbmQoY183NDcpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fNzQ4KSB7XG4gICAgbGV0IHJlc3RfNzQ5ID0gdGVybV83NDgucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzQ4LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzc0OC5pdGVtcy5tYXAoaV83NTAgPT4gdGhpcy5leHBhbmQoaV83NTApKSwgcmVzdDogcmVzdF83NDl9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV83NTEpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fNzUxLCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fNzUyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV83NTIuY29uc2VxdWVudC5tYXAoY183NTMgPT4gdGhpcy5leHBhbmQoY183NTMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fNzU0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83NTQudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fNzU0LmNvbnNlcXVlbnQubWFwKGNfNzU1ID0+IHRoaXMuZXhwYW5kKGNfNzU1KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV83NTYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV83NTYubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzc1Ni5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzU2LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV83NTcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83NTcuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzc1Ny5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fNzU4KSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzc1OSA9IHRlcm1fNzU4LmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NTguY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzU4LmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfNzU5LCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fNzU4LmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzc2MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc2MC5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NjAuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzc2MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc2MS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fNzYyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzYyLmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV83NjIucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc2Mi5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fNzYzKSB7XG4gICAgcmV0dXJuIHRlcm1fNzYzO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV83NjQpIHtcbiAgICByZXR1cm4gdGVybV83NjQ7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV83NjUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV83NjUubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzY1LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV83NjYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NjYuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fNzY3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV83NjcucHJvcGVydGllcy5tYXAodF83NjggPT4gdGhpcy5leHBhbmQodF83NjgpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV83NjkpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfNzcwID0gdGVybV83NjkucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2OS5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV83NjkuZWxlbWVudHMubWFwKHRfNzcxID0+IHRfNzcxID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF83NzEpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF83NzB9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV83NzIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzcyLmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzc3Mi5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fNzczKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fNzczLm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV83NzMubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fNzc0KSB7XG4gICAgbGV0IGluaXRfNzc1ID0gdGVybV83NzQuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzc0LmluaXQpO1xuICAgIGxldCB0ZXN0Xzc3NiA9IHRlcm1fNzc0LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3NC50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzc3NyA9IHRlcm1fNzc0LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzc0LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfNzc4ID0gdGhpcy5leHBhbmQodGVybV83NzQuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzc3NSwgdGVzdDogdGVzdF83NzYsIHVwZGF0ZTogdXBkYXRlXzc3NywgYm9keTogYm9keV83Nzh9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV83NzkpIHtcbiAgICBsZXQgZXhwcl83ODAgPSB0ZXJtXzc3OS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzkuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzc4MH0pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzc4MSkge1xuICAgIGxldCBleHByXzc4MiA9IHRlcm1fNzgxLmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4MS5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfNzgyfSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV83ODMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83ODMudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzgzLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV83ODQpIHtcbiAgICBsZXQgY29uc2VxdWVudF83ODUgPSB0ZXJtXzc4NC5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODQuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV83ODYgPSB0ZXJtXzc4NC5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4NC5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc4NC50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF83ODUsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzc4Nn0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fNzg3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzc4Ny5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzc4OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzc4OC5zdGF0ZW1lbnRzLm1hcChzXzc4OSA9PiB0aGlzLmV4cGFuZChzXzc4OSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV83OTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV83OTAuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fNzkxKSB7XG4gICAgaWYgKHRlcm1fNzkxLmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fNzkxO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzkxLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzc5Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fNzkyLm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc5Mi5uYW1lKSwgc3VwZXI6IHRlcm1fNzkyLnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83OTIuc3VwZXIpLCBlbGVtZW50czogdGVybV83OTIuZWxlbWVudHMubWFwKGVsXzc5MyA9PiB0aGlzLmV4cGFuZChlbF83OTMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV83OTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNzk0Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc5NC5uYW1lKSwgc3VwZXI6IHRlcm1fNzk0LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83OTQuc3VwZXIpLCBlbGVtZW50czogdGVybV83OTQuZWxlbWVudHMubWFwKGVsXzc5NSA9PiB0aGlzLmV4cGFuZChlbF83OTUpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV83OTYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzc5Ni5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzc5Ni5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV83OTcpIHtcbiAgICByZXR1cm4gdGVybV83OTc7XG4gIH1cbiAgZXhwYW5kU3ludGF4VGVtcGxhdGUodGVybV83OTgpIHtcbiAgICBsZXQgZXhwYW5kZXJfNzk5ID0gbmV3IEV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJfODAwID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fNzk4LnRlbXBsYXRlLmlubmVyKCkpO1xuICAgIGxldCBzdHJfODAxID0gU3ludGF4LmZyb21TdHJpbmcoc2VyaWFsaXplci53cml0ZShyXzgwMC50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfODAyID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwic3ludGF4VGVtcGxhdGVcIil9KTtcbiAgICBsZXQgZXhwYW5kZWRJbnRlcnBzXzgwMyA9IHJfODAwLmludGVycC5tYXAoaV84MDUgPT4ge1xuICAgICAgbGV0IGVuZl84MDYgPSBuZXcgRW5mb3Jlc3RlcihpXzgwNSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl84MDYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpKTtcbiAgICB9KTtcbiAgICBsZXQgYXJnc184MDQgPSBMaXN0Lm9mKG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBzdHJfODAxfSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfODAzKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODAyLCBhcmd1bWVudHM6IGFyZ3NfODA0fSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV84MDcpIHtcbiAgICBsZXQgc3RyXzgwOCA9IG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBTeW50YXguZnJvbVN0cmluZyhzZXJpYWxpemVyLndyaXRlKHRlcm1fODA3Lm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzgwNy50ZW1wbGF0ZS50YWcsIGVsZW1lbnRzOiB0ZXJtXzgwNy50ZW1wbGF0ZS5lbGVtZW50cy5wdXNoKHN0cl84MDgpLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV84MDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fODA5Lm9iamVjdCksIHByb3BlcnR5OiB0ZXJtXzgwOS5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzgxMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHRlcm1fODEwLmVsZW1lbnRzLm1hcCh0XzgxMSA9PiB0XzgxMSA9PSBudWxsID8gdF84MTEgOiB0aGlzLmV4cGFuZCh0XzgxMSkpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fODEyKSB7XG4gICAgcmV0dXJuIHRlcm1fODEyO1xuICB9XG4gIGV4cGFuZEltcG9ydE5hbWVzcGFjZSh0ZXJtXzgxMykge1xuICAgIHJldHVybiB0ZXJtXzgxMztcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV84MTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgxNC5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fODE1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV84MTUuYm9keSl9KTtcbiAgfVxuICBleHBhbmRFeHBvcnRGcm9tKHRlcm1fODE2KSB7XG4gICAgcmV0dXJuIHRlcm1fODE2O1xuICB9XG4gIGV4cGFuZEV4cG9ydEFsbEZyb20odGVybV84MTcpIHtcbiAgICByZXR1cm4gdGVybV84MTc7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fODE4KSB7XG4gICAgcmV0dXJuIHRlcm1fODE4O1xuICB9XG4gIGV4cGFuZFN0YXRpY1Byb3BlcnR5TmFtZSh0ZXJtXzgxOSkge1xuICAgIHJldHVybiB0ZXJtXzgxOTtcbiAgfVxuICBleHBhbmREYXRhUHJvcGVydHkodGVybV84MjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODIwLm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEV4cHJlc3Npb24odGVybV84MjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzgyMS5wcm9wZXJ0aWVzLm1hcCh0XzgyMiA9PiB0aGlzLmV4cGFuZCh0XzgyMikpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdG9yKHRlcm1fODIzKSB7XG4gICAgbGV0IGluaXRfODI0ID0gdGVybV84MjMuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fODIzLmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84MjMuYmluZGluZyksIGluaXQ6IGluaXRfODI0fSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtXzgyNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHRlcm1fODI1LmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzgyNS5kZWNsYXJhdG9ycy5tYXAoZF84MjYgPT4gdGhpcy5leHBhbmQoZF84MjYpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fODI3KSB7XG4gICAgaWYgKHRlcm1fODI3LmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzgyOCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODI3LmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF84MjkgPSBlbmZfODI4LnBlZWsoKTtcbiAgICBsZXQgdF84MzAgPSBlbmZfODI4LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzgzMCA9PSBudWxsIHx8IGVuZl84MjgucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzgyOC5jcmVhdGVFcnJvcihsb29rYWhlYWRfODI5LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF84MzApO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzgzMSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fODMxLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzgzMS5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV84MzIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV84MzIuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzgzMi5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV84MzIub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fODMzKSB7XG4gICAgbGV0IGxlZnRfODM0ID0gdGhpcy5leHBhbmQodGVybV84MzMubGVmdCk7XG4gICAgbGV0IHJpZ2h0XzgzNSA9IHRoaXMuZXhwYW5kKHRlcm1fODMzLnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzgzNCwgb3BlcmF0b3I6IHRlcm1fODMzLm9wZXJhdG9yLCByaWdodDogcmlnaHRfODM1fSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fODM2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzgzNi50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV84MzYuY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV84MzYuYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV84MzcpIHtcbiAgICByZXR1cm4gdGVybV84Mzc7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzgzOCkge1xuICAgIGxldCBjYWxsZWVfODM5ID0gdGhpcy5leHBhbmQodGVybV84MzguY2FsbGVlKTtcbiAgICBsZXQgZW5mXzg0MCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODM4LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzg0MSA9IGVuZl84NDAuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzg0MiA9PiB0aGlzLmV4cGFuZChhcmdfODQyKSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODM5LCBhcmd1bWVudHM6IGFyZ3NfODQxLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fODQzKSB7XG4gICAgcmV0dXJuIHRlcm1fODQzO1xuICB9XG4gIGV4cGFuZENhbGxFeHByZXNzaW9uKHRlcm1fODQ0KSB7XG4gICAgbGV0IGNhbGxlZV84NDUgPSB0aGlzLmV4cGFuZCh0ZXJtXzg0NC5jYWxsZWUpO1xuICAgIGxldCBlbmZfODQ2ID0gbmV3IEVuZm9yZXN0ZXIodGVybV84NDQuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfODQ3ID0gZW5mXzg0Ni5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfODQ4ID0+IHRoaXMuZXhwYW5kKGFyZ184NDgpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODQ1LCBhcmd1bWVudHM6IGFyZ3NfODQ3fSk7XG4gIH1cbiAgZXhwYW5kU3ByZWFkRWxlbWVudCh0ZXJtXzg0OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODQ5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzg1MCkge1xuICAgIGxldCBjaGlsZF84NTEgPSB0aGlzLmV4cGFuZCh0ZXJtXzg1MC5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF84NTF9KTtcbiAgfVxuICBleHBhbmRMYWJlbGVkU3RhdGVtZW50KHRlcm1fODUyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fODUyLmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzg1Mi5ib2R5KX0pO1xuICB9XG4gIGRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTMsIHR5cGVfODU0KSB7XG4gICAgbGV0IHNjb3BlXzg1NSA9IGZyZXNoU2NvcGUoXCJmdW5cIik7XG4gICAgbGV0IHJlZF84NTYgPSBuZXcgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlcihzY29wZV84NTUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc184NTc7XG4gICAgaWYgKHR5cGVfODU0ICE9PSBcIkdldHRlclwiICYmIHR5cGVfODU0ICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfODU3ID0gcmVkXzg1Ni50cmFuc2Zvcm0odGVybV84NTMucGFyYW1zKTtcbiAgICAgIHBhcmFtc184NTcgPSB0aGlzLmV4cGFuZChwYXJhbXNfODU3KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzg1NSk7XG4gICAgbGV0IGV4cGFuZGVyXzg1OCA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5Xzg1OSwgYm9keVRlcm1fODYwO1xuICAgIGlmICh0ZXJtXzg1My5ib2R5IGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgYm9keVRlcm1fODYwID0gdGhpcy5leHBhbmQodGVybV84NTMuYm9keS5hZGRTY29wZShzY29wZV84NTUsIHRoaXMuY29udGV4dC5iaW5kaW5ncykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5Xzg1OSA9IHRlcm1fODUzLmJvZHkubWFwKGJfODYxID0+IGJfODYxLmFkZFNjb3BlKHNjb3BlXzg1NSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgICBib2R5VGVybV84NjAgPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBleHBhbmRlcl84NTguZXhwYW5kKG1hcmtlZEJvZHlfODU5KX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzg1NCA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODU0LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV84NTMubmFtZSksIGJvZHk6IGJvZHlUZXJtXzg2MH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZV84NTQgPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg1NCwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODUzLm5hbWUpLCBwYXJhbTogdGVybV84NTMucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzg2MH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NTQsIHtuYW1lOiB0ZXJtXzg1My5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV84NTMuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzg1NywgYm9keTogYm9keVRlcm1fODYwfSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fODYyKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg2MiwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fODYzKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg2MywgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fODY0KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg2NCwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzg2NSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NjUsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV84NjYpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODY2LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fODY3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84NjcuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzg2Ny5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NjcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzg2OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzg2OC5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NjguZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzg2OSkge1xuICAgIHJldHVybiB0ZXJtXzg2OTtcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV84NzApIHtcbiAgICByZXR1cm4gdGVybV84NzA7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fODcxKSB7XG4gICAgcmV0dXJuIHRlcm1fODcxO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV84NzIpIHtcbiAgICByZXR1cm4gdGVybV84NzI7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV84NzMpIHtcbiAgICBsZXQgdHJhbnNfODc0ID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV84NzMubmFtZS5yZXNvbHZlKCkpO1xuICAgIGlmICh0cmFuc184NzQpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc184NzQuaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fODczO1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzg3NSkge1xuICAgIHJldHVybiB0ZXJtXzg3NTtcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzg3Nikge1xuICAgIHJldHVybiB0ZXJtXzg3NjtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzg3Nykge1xuICAgIHJldHVybiB0ZXJtXzg3NztcbiAgfVxufVxuIl19