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
  function TermExpander(context_727) {
    _classCallCheck(this, TermExpander);

    this.context = context_727;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_728) {
      var field_729 = "expand" + term_728.type;
      if (typeof this[field_729] === "function") {
        return this[field_729](term_728);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_728.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_730) {
      return new _terms2.default("TemplateExpression", { tag: term_730.tag == null ? null : this.expand(term_730.tag), elements: term_730.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_731) {
      return new _terms2.default("BreakStatement", { label: term_731.label ? term_731.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_732) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_732.body), test: this.expand(term_732.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_733) {
      return new _terms2.default("WithStatement", { body: this.expand(term_733.body), object: this.expand(term_733.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_734) {
      return term_734;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_735) {
      return new _terms2.default("ContinueStatement", { label: term_735.label ? term_735.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_736) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_736.discriminant), preDefaultCases: term_736.preDefaultCases.map(function (c_737) {
          return _this.expand(c_737);
        }).toArray(), defaultCase: this.expand(term_736.defaultCase), postDefaultCases: term_736.postDefaultCases.map(function (c_738) {
          return _this.expand(c_738);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_739) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_739.object), expression: this.expand(term_739.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_740) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_740.discriminant), cases: term_740.cases.map(function (c_741) {
          return _this2.expand(c_741);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_742) {
      var _this3 = this;

      var rest_743 = term_742.rest == null ? null : this.expand(term_742.rest);
      return new _terms2.default("FormalParameters", { items: term_742.items.map(function (i_744) {
          return _this3.expand(i_744);
        }), rest: rest_743 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_745) {
      return this.doFunctionExpansion(term_745, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_746) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_746.consequent.map(function (c_747) {
          return _this4.expand(c_747);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_748) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_748.test), consequent: term_748.consequent.map(function (c_749) {
          return _this5.expand(c_749);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_750) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_750.left), right: this.expand(term_750.right), body: this.expand(term_750.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_751) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_751.body), catchClause: this.expand(term_751.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_752) {
      var catchClause_753 = term_752.catchClause == null ? null : this.expand(term_752.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_752.body), catchClause: catchClause_753, finalizer: this.expand(term_752.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_754) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_754.binding), body: this.expand(term_754.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_755) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_755.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_756) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_756.left), right: this.expand(term_756.right), body: this.expand(term_756.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_757) {
      return term_757;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_758) {
      return term_758;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_759) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_759.name), binding: this.expand(term_759.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_760) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_760.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_761) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_761.properties.map(function (t_762) {
          return _this6.expand(t_762);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_763) {
      var _this7 = this;

      var restElement_764 = term_763.restElement == null ? null : this.expand(term_763.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_763.elements.map(function (t_765) {
          return t_765 == null ? null : _this7.expand(t_765);
        }).toArray(), restElement: restElement_764 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_766) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_766.binding), init: this.expand(term_766.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_767) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_767.name }), expression: new _terms2.default("IdentifierExpression", { name: term_767.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_768) {
      var init_769 = term_768.init == null ? null : this.expand(term_768.init);
      var test_770 = term_768.test == null ? null : this.expand(term_768.test);
      var update_771 = term_768.update == null ? null : this.expand(term_768.update);
      var body_772 = this.expand(term_768.body);
      return new _terms2.default("ForStatement", { init: init_769, test: test_770, update: update_771, body: body_772 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_773) {
      var expr_774 = term_773.expression == null ? null : this.expand(term_773.expression);
      return new _terms2.default("YieldExpression", { expression: expr_774 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_775) {
      var expr_776 = term_775.expression == null ? null : this.expand(term_775.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_776 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_777) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_777.test), body: this.expand(term_777.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_778) {
      var consequent_779 = term_778.consequent == null ? null : this.expand(term_778.consequent);
      var alternate_780 = term_778.alternate == null ? null : this.expand(term_778.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_778.test), consequent: consequent_779, alternate: alternate_780 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_781) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_781.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_782) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_782.statements.map(function (s_783) {
          return _this8.expand(s_783);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_784) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_784.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_785) {
      if (term_785.expression == null) {
        return term_785;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_785.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_786) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_786.name == null ? null : this.expand(term_786.name), super: term_786.super == null ? null : this.expand(term_786.super), elements: term_786.elements.map(function (el_787) {
          return _this9.expand(el_787);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_788) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_788.name == null ? null : this.expand(term_788.name), super: term_788.super == null ? null : this.expand(term_788.super), elements: term_788.elements.map(function (el_789) {
          return _this10.expand(el_789);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_790) {
      return new _terms2.default("ClassElement", { isStatic: term_790.isStatic, method: this.expand(term_790.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_791) {
      return term_791;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_792) {
      var _this11 = this;

      var expander_793 = new _expander2.default(this.context);
      var r_794 = (0, _templateProcessor.processTemplate)(term_792.template.inner());
      var str_795 = _syntax2.default.fromString(_serializer.serializer.write(r_794.template));
      var callee_796 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_797 = r_794.interp.map(function (i_799) {
        var enf_800 = new _enforester.Enforester(i_799, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_800.enforest("expression"));
      });
      var args_798 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_795 })).concat(expandedInterps_797);
      return new _terms2.default("CallExpression", { callee: callee_796, arguments: args_798 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_801) {
      var str_802 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_801.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_801.template.tag, elements: term_801.template.elements.push(str_802).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_803) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_803.object), property: term_803.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_804) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_804.elements.map(function (t_805) {
          return t_805 == null ? t_805 : _this12.expand(t_805);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_806) {
      return term_806;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_807) {
      return term_807;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_808) {
      return new _terms2.default("Export", { declaration: this.expand(term_808.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_809) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_809.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_810) {
      return term_810;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_811) {
      return term_811;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_812) {
      return term_812;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_813) {
      return term_813;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_814) {
      return new _terms2.default("DataProperty", { name: this.expand(term_814.name), expression: this.expand(term_814.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_815) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_815.properties.map(function (t_816) {
          return _this13.expand(t_816);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_817) {
      var init_818 = term_817.init == null ? null : this.expand(term_817.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_817.binding), init: init_818 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_819) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_819.kind, declarators: term_819.declarators.map(function (d_820) {
          return _this14.expand(d_820);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_821) {
      if (term_821.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_822 = new _enforester.Enforester(term_821.inner, (0, _immutable.List)(), this.context);
      var lookahead_823 = enf_822.peek();
      var t_824 = enf_822.enforestExpression();
      if (t_824 == null || enf_822.rest.size > 0) {
        throw enf_822.createError(lookahead_823, "unexpected syntax");
      }
      return this.expand(t_824);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_825) {
      return new _terms2.default("UnaryExpression", { operator: term_825.operator, operand: this.expand(term_825.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_826) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_826.isPrefix, operator: term_826.operator, operand: this.expand(term_826.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_827) {
      var left_828 = this.expand(term_827.left);
      var right_829 = this.expand(term_827.right);
      return new _terms2.default("BinaryExpression", { left: left_828, operator: term_827.operator, right: right_829 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_830) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_830.test), consequent: this.expand(term_830.consequent), alternate: this.expand(term_830.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_831) {
      return term_831;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_832) {
      var _this15 = this;

      var callee_833 = this.expand(term_832.callee);
      var enf_834 = new _enforester.Enforester(term_832.arguments, (0, _immutable.List)(), this.context);
      var args_835 = enf_834.enforestArgumentList().map(function (arg_836) {
        return _this15.expand(arg_836);
      });
      return new _terms2.default("NewExpression", { callee: callee_833, arguments: args_835.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_837) {
      return term_837;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_838) {
      var _this16 = this;

      var callee_839 = this.expand(term_838.callee);
      var enf_840 = new _enforester.Enforester(term_838.arguments, (0, _immutable.List)(), this.context);
      var args_841 = enf_840.enforestArgumentList().map(function (arg_842) {
        return _this16.expand(arg_842);
      });
      return new _terms2.default("CallExpression", { callee: callee_839, arguments: args_841 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_843) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_843.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_844) {
      var child_845 = this.expand(term_844.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_845 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_846) {
      return new _terms2.default("LabeledStatement", { label: term_846.label.val(), body: this.expand(term_846.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_847, type_848) {
      var _this17 = this;

      var scope_849 = (0, _scope.freshScope)("fun");
      var red_850 = new _applyScopeInParamsReducer2.default(scope_849, this.context);
      var params_851 = undefined;
      if (type_848 !== "Getter" && type_848 !== "Setter") {
        params_851 = red_850.transform(term_847.params);
        params_851 = this.expand(params_851);
      }
      this.context.currentScope.push(scope_849);
      var expander_852 = new _expander2.default(this.context);
      var markedBody_853 = undefined,
          bodyTerm_854 = undefined;
      if (term_847.body instanceof _terms2.default) {
        bodyTerm_854 = this.expand(term_847.body.addScope(scope_849, this.context.bindings));
      } else {
        markedBody_853 = term_847.body.map(function (b_855) {
          return b_855.addScope(scope_849, _this17.context.bindings);
        });
        bodyTerm_854 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_852.expand(markedBody_853) });
      }
      this.context.currentScope.pop();
      if (type_848 === "Getter") {
        return new _terms2.default(type_848, { name: this.expand(term_847.name), body: bodyTerm_854 });
      } else if (type_848 === "Setter") {
        return new _terms2.default(type_848, { name: this.expand(term_847.name), param: term_847.param, body: bodyTerm_854 });
      }
      return new _terms2.default(type_848, { name: term_847.name, isGenerator: term_847.isGenerator, params: params_851, body: bodyTerm_854 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_856) {
      return this.doFunctionExpansion(term_856, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_857) {
      return this.doFunctionExpansion(term_857, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_858) {
      return this.doFunctionExpansion(term_858, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_859) {
      return this.doFunctionExpansion(term_859, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_860) {
      return this.doFunctionExpansion(term_860, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_861) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_861.binding), operator: term_861.operator, expression: this.expand(term_861.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_862) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_862.binding), expression: this.expand(term_862.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_863) {
      return term_863;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_864) {
      return term_864;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_865) {
      return term_865;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_866) {
      return term_866;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_867) {
      var trans_868 = this.context.env.get(term_867.name.resolve());
      if (trans_868) {
        return new _terms2.default("IdentifierExpression", { name: trans_868.id });
      }
      return term_867;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_869) {
      return term_869;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_870) {
      return term_870;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_871) {
      return term_871;
    }
  }]);

  return TermExpander;
})();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFXcUIsWUFBWTtBQUMvQixXQURtQixZQUFZLENBQ25CLFdBQVcsRUFBRTswQkFETixZQUFZOztBQUU3QixRQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztHQUM1Qjs7ZUFIa0IsWUFBWTs7MkJBSXhCLFFBQVEsRUFBRTtBQUNmLFVBQUksU0FBUyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ3pDLFVBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3pDLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2xDO0FBQ0QsMEJBQU8sS0FBSyxFQUFFLGtDQUFrQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuRTs7OzZDQUN3QixRQUFRLEVBQUU7QUFDakMsYUFBTyxvQkFBUyxvQkFBb0IsRUFBRSxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQzlJOzs7eUNBQ29CLFFBQVEsRUFBRTtBQUM3QixhQUFPLG9CQUFTLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7MkNBQ3NCLFFBQVEsRUFBRTtBQUMvQixhQUFPLG9CQUFTLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDM0c7Ozt3Q0FDbUIsUUFBUSxFQUFFO0FBQzVCLGFBQU8sb0JBQVMsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDNUc7Ozs0Q0FDdUIsUUFBUSxFQUFFO0FBQ2hDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7NENBQ3VCLFFBQVEsRUFBRTtBQUNoQyxhQUFPLG9CQUFTLG1CQUFtQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQzdGOzs7cURBQ2dDLFFBQVEsRUFBRTs7O0FBQ3pDLGFBQU8sb0JBQVMsNEJBQTRCLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxNQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2lCQUFJLE1BQUssTUFBTSxDQUFDLEtBQUssQ0FBQztTQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDalU7OzttREFDOEIsUUFBUSxFQUFFO0FBQ3ZDLGFBQU8sb0JBQVMsMEJBQTBCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNuSTs7OzBDQUNxQixRQUFRLEVBQUU7OztBQUM5QixhQUFPLG9CQUFTLGlCQUFpQixFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksT0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQUEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztLQUMxSjs7OzJDQUNzQixRQUFRLEVBQUU7OztBQUMvQixVQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekUsYUFBTyxvQkFBUyxrQkFBa0IsRUFBRSxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksT0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQUEsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQy9HOzs7MENBQ3FCLFFBQVEsRUFBRTtBQUM5QixhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztLQUM5RDs7O3dDQUNtQixRQUFRLEVBQUU7OztBQUM1QixhQUFPLG9CQUFTLGVBQWUsRUFBRSxFQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksT0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQUEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztLQUNoSDs7O3FDQUNnQixRQUFRLEVBQUU7OztBQUN6QixhQUFPLG9CQUFTLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2lCQUFJLE9BQUssTUFBTSxDQUFDLEtBQUssQ0FBQztTQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDL0k7Ozt5Q0FDb0IsUUFBUSxFQUFFO0FBQzdCLGFBQU8sb0JBQVMsZ0JBQWdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDN0k7Ozs0Q0FDdUIsUUFBUSxFQUFFO0FBQ2hDLGFBQU8sb0JBQVMsbUJBQW1CLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUMxSDs7OzhDQUN5QixRQUFRLEVBQUU7QUFDbEMsVUFBSSxlQUFlLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlGLGFBQU8sb0JBQVMscUJBQXFCLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3RKOzs7c0NBQ2lCLFFBQVEsRUFBRTtBQUMxQixhQUFPLG9CQUFTLGFBQWEsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzVHOzs7eUNBQ29CLFFBQVEsRUFBRTtBQUM3QixhQUFPLG9CQUFTLGdCQUFnQixFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNuRjs7O3lDQUNvQixRQUFRLEVBQUU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUM3STs7OzRDQUN1QixRQUFRLEVBQUU7QUFDaEMsYUFBTyxRQUFRLENBQUM7S0FDakI7OztvREFDK0IsUUFBUSxFQUFFO0FBQ3hDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7a0RBQzZCLFFBQVEsRUFBRTtBQUN0QyxhQUFPLG9CQUFTLHlCQUF5QixFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDeEg7OzsrQ0FDMEIsUUFBUSxFQUFFO0FBQ25DLGFBQU8sb0JBQVMsc0JBQXNCLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3pGOzs7d0NBQ21CLFFBQVEsRUFBRTs7O0FBQzVCLGFBQU8sb0JBQVMsZUFBZSxFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxPQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ2hIOzs7dUNBQ2tCLFFBQVEsRUFBRTs7O0FBQzNCLFVBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxXQUFXLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5RixhQUFPLG9CQUFTLGNBQWMsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsT0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQUEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO0tBQ2hLOzs7NkNBQ3dCLFFBQVEsRUFBRTtBQUNqQyxhQUFPLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDbkg7Ozs0Q0FDdUIsUUFBUSxFQUFFO0FBQ2hDLGFBQU8sb0JBQVMsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxvQkFBUyxzQkFBc0IsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDdEs7Ozt1Q0FDa0IsUUFBUSxFQUFFO0FBQzNCLFVBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RSxVQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekUsVUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFDLGFBQU8sb0JBQVMsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDdkc7OzswQ0FDcUIsUUFBUSxFQUFFO0FBQzlCLFVBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRixhQUFPLG9CQUFTLGlCQUFpQixFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDNUQ7OzttREFDOEIsUUFBUSxFQUFFO0FBQ3ZDLFVBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyRixhQUFPLG9CQUFTLDBCQUEwQixFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDckU7Ozt5Q0FDb0IsUUFBUSxFQUFFO0FBQzdCLGFBQU8sb0JBQVMsZ0JBQWdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN6Rzs7O3NDQUNpQixRQUFRLEVBQUU7QUFDMUIsVUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNGLFVBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4RixhQUFPLG9CQUFTLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO0tBQzFIOzs7eUNBQ29CLFFBQVEsRUFBRTtBQUM3QixhQUFPLG9CQUFTLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN6RTs7O2dDQUNXLFFBQVEsRUFBRTs7O0FBQ3BCLGFBQU8sb0JBQVMsT0FBTyxFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxPQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ3hHOzs7dURBQ2tDLFFBQVEsRUFBRTtBQUMzQyxhQUFPLG9CQUFTLDhCQUE4QixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNuRzs7OzBDQUNxQixRQUFRLEVBQUU7QUFDOUIsVUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRTtBQUMvQixlQUFPLFFBQVEsQ0FBQztPQUNqQjtBQUNELGFBQU8sb0JBQVMsaUJBQWlCLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3BGOzs7MkNBQ3NCLFFBQVEsRUFBRTs7O0FBQy9CLGFBQU8sb0JBQVMsa0JBQWtCLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTTtpQkFBSSxPQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ3RQOzs7MENBQ3FCLFFBQVEsRUFBRTs7O0FBQzlCLGFBQU8sb0JBQVMsaUJBQWlCLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTTtpQkFBSSxRQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FBQSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ3JQOzs7dUNBQ2tCLFFBQVEsRUFBRTtBQUMzQixhQUFPLG9CQUFTLGNBQWMsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDdEc7Ozt5Q0FDb0IsUUFBUSxFQUFFO0FBQzdCLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7eUNBQ29CLFFBQVEsRUFBRTs7O0FBQzdCLFVBQUksWUFBWSxHQUFHLHVCQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxVQUFJLEtBQUssR0FBRyx3Q0FBZ0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksT0FBTyxHQUFHLGlCQUFPLFVBQVUsQ0FBQyx1QkFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbEUsVUFBSSxVQUFVLEdBQUcsb0JBQVMsc0JBQXNCLEVBQUUsRUFBQyxJQUFJLEVBQUUsaUJBQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ25HLFVBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDbEQsWUFBSSxPQUFPLEdBQUcsMkJBQWUsS0FBSyxFQUFFLHNCQUFNLEVBQUUsUUFBSyxPQUFPLENBQUMsQ0FBQztBQUMxRCxlQUFPLFFBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztPQUNwRCxDQUFDLENBQUM7QUFDSCxVQUFJLFFBQVEsR0FBRyxnQkFBSyxFQUFFLENBQUMsb0JBQVMseUJBQXlCLEVBQUUsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzFHLGFBQU8sb0JBQVMsZ0JBQWdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQzlFOzs7c0NBQ2lCLFFBQVEsRUFBRTtBQUMxQixVQUFJLE9BQU8sR0FBRyxvQkFBUyx5QkFBeUIsRUFBRSxFQUFDLEtBQUssRUFBRSxpQkFBTyxVQUFVLENBQUMsdUJBQVcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUMvRyxhQUFPLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFTLGlCQUFpQixFQUFFLEVBQUMsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDckw7OztpREFDNEIsUUFBUSxFQUFFO0FBQ3JDLGFBQU8sb0JBQVMsd0JBQXdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQ2hIOzs7MENBQ3FCLFFBQVEsRUFBRTs7O0FBQzlCLGFBQU8sb0JBQVMsaUJBQWlCLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2lCQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLFFBQUssTUFBTSxDQUFDLEtBQUssQ0FBQztTQUFBLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDNUg7OztpQ0FDWSxRQUFRLEVBQUU7QUFDckIsYUFBTyxRQUFRLENBQUM7S0FDakI7OzswQ0FDcUIsUUFBUSxFQUFFO0FBQzlCLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7aUNBQ1ksUUFBUSxFQUFFO0FBQ3JCLGFBQU8sb0JBQVMsUUFBUSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUM3RTs7O3dDQUNtQixRQUFRLEVBQUU7QUFDNUIsYUFBTyxvQkFBUyxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3RFOzs7cUNBQ2dCLFFBQVEsRUFBRTtBQUN6QixhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O3dDQUNtQixRQUFRLEVBQUU7QUFDNUIsYUFBTyxRQUFRLENBQUM7S0FDakI7OzswQ0FDcUIsUUFBUSxFQUFFO0FBQzlCLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7NkNBQ3dCLFFBQVEsRUFBRTtBQUNqQyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O3VDQUNrQixRQUFRLEVBQUU7QUFDM0IsYUFBTyxvQkFBUyxjQUFjLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNuSDs7OzJDQUNzQixRQUFRLEVBQUU7OztBQUMvQixhQUFPLG9CQUFTLGtCQUFrQixFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxRQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3pHOzs7NkNBQ3dCLFFBQVEsRUFBRTtBQUNqQyxVQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekUsYUFBTyxvQkFBUyxvQkFBb0IsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUNqRzs7OzhDQUN5QixRQUFRLEVBQUU7OztBQUNsQyxhQUFPLG9CQUFTLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFBSSxRQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FBQSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ25JOzs7a0RBQzZCLFFBQVEsRUFBRTtBQUN0QyxVQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUM3QixjQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLE9BQU8sR0FBRywyQkFBZSxRQUFRLENBQUMsS0FBSyxFQUFFLHNCQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25FLFVBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxVQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUN6QyxVQUFJLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQzFDLGNBQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztPQUMvRDtBQUNELGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjs7OzBDQUNxQixRQUFRLEVBQUU7QUFDOUIsYUFBTyxvQkFBUyxpQkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDM0c7OzsyQ0FDc0IsUUFBUSxFQUFFO0FBQy9CLGFBQU8sb0JBQVMsa0JBQWtCLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3pJOzs7MkNBQ3NCLFFBQVEsRUFBRTtBQUMvQixVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxhQUFPLG9CQUFTLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztLQUN0Rzs7O2dEQUMyQixRQUFRLEVBQUU7QUFDcEMsYUFBTyxvQkFBUyx1QkFBdUIsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN4Szs7OzhDQUN5QixRQUFRLEVBQUU7QUFDbEMsYUFBTyxRQUFRLENBQUM7S0FDakI7Ozt3Q0FDbUIsUUFBUSxFQUFFOzs7QUFDNUIsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUMsVUFBSSxPQUFPLEdBQUcsMkJBQWUsUUFBUSxDQUFDLFNBQVMsRUFBRSxzQkFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RSxVQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2VBQUksUUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ25GLGFBQU8sb0JBQVMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztLQUN2Rjs7O2dDQUNXLFFBQVEsRUFBRTtBQUNwQixhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O3lDQUNvQixRQUFRLEVBQUU7OztBQUM3QixVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxVQUFJLE9BQU8sR0FBRywyQkFBZSxRQUFRLENBQUMsU0FBUyxFQUFFLHNCQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU87ZUFBSSxRQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDbkYsYUFBTyxvQkFBUyxnQkFBZ0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDOUU7Ozt3Q0FDbUIsUUFBUSxFQUFFO0FBQzVCLGFBQU8sb0JBQVMsZUFBZSxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNsRjs7OzhDQUN5QixRQUFRLEVBQUU7QUFDbEMsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQsYUFBTyxvQkFBUyxxQkFBcUIsRUFBRSxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO0tBQ2pFOzs7MkNBQ3NCLFFBQVEsRUFBRTtBQUMvQixhQUFPLG9CQUFTLGtCQUFrQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN0Rzs7O3dDQUNtQixRQUFRLEVBQUUsUUFBUSxFQUFFOzs7QUFDdEMsVUFBSSxTQUFTLEdBQUcsdUJBQVcsS0FBSyxDQUFDLENBQUM7QUFDbEMsVUFBSSxPQUFPLEdBQUcsd0NBQThCLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckUsVUFBSSxVQUFVLFlBQUEsQ0FBQztBQUNmLFVBQUksUUFBUSxLQUFLLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQ2xELGtCQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsa0JBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ3RDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksWUFBWSxHQUFHLHVCQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxVQUFJLGNBQWMsWUFBQTtVQUFFLFlBQVksWUFBQSxDQUFDO0FBQ2pDLFVBQUksUUFBUSxDQUFDLElBQUksMkJBQWdCLEVBQUU7QUFDakMsb0JBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7T0FDdEYsTUFBTTtBQUNMLHNCQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2lCQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUFBLENBQUMsQ0FBQztBQUM5RixvQkFBWSxHQUFHLG9CQUFTLGNBQWMsRUFBRSxFQUFDLFVBQVUsRUFBRSxzQkFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUNoSDtBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLFVBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUN6QixlQUFPLG9CQUFTLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztPQUNuRixNQUFNLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUNoQyxlQUFPLG9CQUFTLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztPQUMxRztBQUNELGFBQU8sb0JBQVMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztLQUM3SDs7O2lDQUNZLFFBQVEsRUFBRTtBQUNyQixhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDckQ7OztpQ0FDWSxRQUFRLEVBQUU7QUFDckIsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3JEOzs7aUNBQ1ksUUFBUSxFQUFFO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNyRDs7OzhDQUN5QixRQUFRLEVBQUU7QUFDbEMsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FDbEU7Ozs2Q0FDd0IsUUFBUSxFQUFFO0FBQ2pDLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0tBQ2pFOzs7dURBQ2tDLFFBQVEsRUFBRTtBQUMzQyxhQUFPLG9CQUFTLDhCQUE4QixFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDdEs7OzsrQ0FDMEIsUUFBUSxFQUFFO0FBQ25DLGFBQU8sb0JBQVMsc0JBQXNCLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUNqSTs7O3lDQUNvQixRQUFRLEVBQUU7QUFDN0IsYUFBTyxRQUFRLENBQUM7S0FDakI7OzttREFDOEIsUUFBUSxFQUFFO0FBQ3ZDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7bURBQzhCLFFBQVEsRUFBRTtBQUN2QyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O29EQUMrQixRQUFRLEVBQUU7QUFDeEMsYUFBTyxRQUFRLENBQUM7S0FDakI7OzsrQ0FDMEIsUUFBUSxFQUFFO0FBQ25DLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDOUQsVUFBSSxTQUFTLEVBQUU7QUFDYixlQUFPLG9CQUFTLHNCQUFzQixFQUFFLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsYUFBTyxRQUFRLENBQUM7S0FDakI7OztnREFDMkIsUUFBUSxFQUFFO0FBQ3BDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7a0RBQzZCLFFBQVEsRUFBRTtBQUN0QyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O2tEQUM2QixRQUFRLEVBQUU7QUFDdEMsYUFBTyxRQUFRLENBQUM7S0FDakI7OztTQTNVa0IsWUFBWTs7O2tCQUFaLFlBQVkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlciBmcm9tIFwiLi9hcHBseS1zY29wZS1pbi1wYXJhbXMtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgRXhwYW5kZXIgZnJvbSBcIi4vZXhwYW5kZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQge3NlcmlhbGl6ZXIsIG1ha2VEZXNlcmlhbGl6ZXJ9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge3Byb2Nlc3NUZW1wbGF0ZX0gZnJvbSBcIi4vdGVtcGxhdGUtcHJvY2Vzc29yLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtRXhwYW5kZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzcyNykge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfNzI3O1xuICB9XG4gIGV4cGFuZCh0ZXJtXzcyOCkge1xuICAgIGxldCBmaWVsZF83MjkgPSBcImV4cGFuZFwiICsgdGVybV83MjgudHlwZTtcbiAgICBpZiAodHlwZW9mIHRoaXNbZmllbGRfNzI5XSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gdGhpc1tmaWVsZF83MjldKHRlcm1fNzI4KTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcImV4cGFuZCBub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyB0ZXJtXzcyOC50eXBlKTtcbiAgfVxuICBleHBhbmRUZW1wbGF0ZUV4cHJlc3Npb24odGVybV83MzApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV83MzAudGFnID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83MzAudGFnKSwgZWxlbWVudHM6IHRlcm1fNzMwLmVsZW1lbnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEJyZWFrU3RhdGVtZW50KHRlcm1fNzMxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzczMS5sYWJlbCA/IHRlcm1fNzMxLmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZERvV2hpbGVTdGF0ZW1lbnQodGVybV83MzIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzczMi5ib2R5KSwgdGVzdDogdGhpcy5leHBhbmQodGVybV83MzIudGVzdCl9KTtcbiAgfVxuICBleHBhbmRXaXRoU3RhdGVtZW50KHRlcm1fNzMzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83MzMuYm9keSksIG9iamVjdDogdGhpcy5leHBhbmQodGVybV83MzMub2JqZWN0KX0pO1xuICB9XG4gIGV4cGFuZERlYnVnZ2VyU3RhdGVtZW50KHRlcm1fNzM0KSB7XG4gICAgcmV0dXJuIHRlcm1fNzM0O1xuICB9XG4gIGV4cGFuZENvbnRpbnVlU3RhdGVtZW50KHRlcm1fNzM1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzczNS5sYWJlbCA/IHRlcm1fNzM1LmxhYmVsLnZhbCgpIDogbnVsbH0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0KHRlcm1fNzM2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV83MzYuZGlzY3JpbWluYW50KSwgcHJlRGVmYXVsdENhc2VzOiB0ZXJtXzczNi5wcmVEZWZhdWx0Q2FzZXMubWFwKGNfNzM3ID0+IHRoaXMuZXhwYW5kKGNfNzM3KSkudG9BcnJheSgpLCBkZWZhdWx0Q2FzZTogdGhpcy5leHBhbmQodGVybV83MzYuZGVmYXVsdENhc2UpLCBwb3N0RGVmYXVsdENhc2VzOiB0ZXJtXzczNi5wb3N0RGVmYXVsdENhc2VzLm1hcChjXzczOCA9PiB0aGlzLmV4cGFuZChjXzczOCkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzczOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzczOS5vYmplY3QpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzczOS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudCh0ZXJtXzc0MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzc0MC5kaXNjcmltaW5hbnQpLCBjYXNlczogdGVybV83NDAuY2FzZXMubWFwKGNfNzQxID0+IHRoaXMuZXhwYW5kKGNfNzQxKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ybWFsUGFyYW1ldGVycyh0ZXJtXzc0Mikge1xuICAgIGxldCByZXN0Xzc0MyA9IHRlcm1fNzQyLnJlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc0Mi5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogdGVybV83NDIuaXRlbXMubWFwKGlfNzQ0ID0+IHRoaXMuZXhwYW5kKGlfNzQ0KSksIHJlc3Q6IHJlc3RfNzQzfSk7XG4gIH1cbiAgZXhwYW5kQXJyb3dFeHByZXNzaW9uKHRlcm1fNzQ1KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzc0NSwgXCJBcnJvd0V4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtXzc0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRlcm1fNzQ2LmNvbnNlcXVlbnQubWFwKGNfNzQ3ID0+IHRoaXMuZXhwYW5kKGNfNzQ3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoQ2FzZSh0ZXJtXzc0OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzQ4LnRlc3QpLCBjb25zZXF1ZW50OiB0ZXJtXzc0OC5jb25zZXF1ZW50Lm1hcChjXzc0OSA9PiB0aGlzLmV4cGFuZChjXzc0OSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEZvckluU3RhdGVtZW50KHRlcm1fNzUwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ySW5TdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzUwLmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV83NTAucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc1MC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZFRyeUNhdGNoU3RhdGVtZW50KHRlcm1fNzUxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5Q2F0Y2hTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzUxLmJvZHkpLCBjYXRjaENsYXVzZTogdGhpcy5leHBhbmQodGVybV83NTEuY2F0Y2hDbGF1c2UpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5RmluYWxseVN0YXRlbWVudCh0ZXJtXzc1Mikge1xuICAgIGxldCBjYXRjaENsYXVzZV83NTMgPSB0ZXJtXzc1Mi5jYXRjaENsYXVzZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzUyLmNhdGNoQ2xhdXNlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc1Mi5ib2R5KSwgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlXzc1MywgZmluYWxpemVyOiB0aGlzLmV4cGFuZCh0ZXJtXzc1Mi5maW5hbGl6ZXIpfSk7XG4gIH1cbiAgZXhwYW5kQ2F0Y2hDbGF1c2UodGVybV83NTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV83NTQuYmluZGluZyksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzU0LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVGhyb3dTdGF0ZW1lbnQodGVybV83NTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NTUuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRGb3JPZlN0YXRlbWVudCh0ZXJtXzc1Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvck9mU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzc1Ni5sZWZ0KSwgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm1fNzU2LnJpZ2h0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NTYuYm9keSl9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nSWRlbnRpZmllcih0ZXJtXzc1Nykge1xuICAgIHJldHVybiB0ZXJtXzc1NztcbiAgfVxuICBleHBhbmRCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyKHRlcm1fNzU4KSB7XG4gICAgcmV0dXJuIHRlcm1fNzU4O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5KHRlcm1fNzU5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fNzU5Lm5hbWUpLCBiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc1OS5iaW5kaW5nKX0pO1xuICB9XG4gIGV4cGFuZENvbXB1dGVkUHJvcGVydHlOYW1lKHRlcm1fNzYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzYwLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0QmluZGluZyh0ZXJtXzc2MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fNzYxLnByb3BlcnRpZXMubWFwKHRfNzYyID0+IHRoaXMuZXhwYW5kKHRfNzYyKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm1fNzYzKSB7XG4gICAgbGV0IHJlc3RFbGVtZW50Xzc2NCA9IHRlcm1fNzYzLnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjMucmVzdEVsZW1lbnQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fNzYzLmVsZW1lbnRzLm1hcCh0Xzc2NSA9PiB0Xzc2NSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRfNzY1KSkudG9BcnJheSgpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfNzY0fSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1dpdGhEZWZhdWx0KHRlcm1fNzY2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc2Ni5iaW5kaW5nKSwgaW5pdDogdGhpcy5leHBhbmQodGVybV83NjYuaW5pdCl9KTtcbiAgfVxuICBleHBhbmRTaG9ydGhhbmRQcm9wZXJ0eSh0ZXJtXzc2Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0ZXJtXzc2Ny5uYW1lfSksIGV4cHJlc3Npb246IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNzY3Lm5hbWV9KX0pO1xuICB9XG4gIGV4cGFuZEZvclN0YXRlbWVudCh0ZXJtXzc2OCkge1xuICAgIGxldCBpbml0Xzc2OSA9IHRlcm1fNzY4LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2OC5pbml0KTtcbiAgICBsZXQgdGVzdF83NzAgPSB0ZXJtXzc2OC50ZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjgudGVzdCk7XG4gICAgbGV0IHVwZGF0ZV83NzEgPSB0ZXJtXzc2OC51cGRhdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2OC51cGRhdGUpO1xuICAgIGxldCBib2R5Xzc3MiA9IHRoaXMuZXhwYW5kKHRlcm1fNzY4LmJvZHkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF83NjksIHRlc3Q6IHRlc3RfNzcwLCB1cGRhdGU6IHVwZGF0ZV83NzEsIGJvZHk6IGJvZHlfNzcyfSk7XG4gIH1cbiAgZXhwYW5kWWllbGRFeHByZXNzaW9uKHRlcm1fNzczKSB7XG4gICAgbGV0IGV4cHJfNzc0ID0gdGVybV83NzMuZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzczLmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl83NzR9KTtcbiAgfVxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybV83NzUpIHtcbiAgICBsZXQgZXhwcl83NzYgPSB0ZXJtXzc3NS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzUuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzc3Nn0pO1xuICB9XG4gIGV4cGFuZFdoaWxlU3RhdGVtZW50KHRlcm1fNzc3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzc3LnRlc3QpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc3Ny5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZElmU3RhdGVtZW50KHRlcm1fNzc4KSB7XG4gICAgbGV0IGNvbnNlcXVlbnRfNzc5ID0gdGVybV83NzguY29uc2VxdWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzc4LmNvbnNlcXVlbnQpO1xuICAgIGxldCBhbHRlcm5hdGVfNzgwID0gdGVybV83NzguYWx0ZXJuYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzguYWx0ZXJuYXRlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83NzgudGVzdCksIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfNzc5LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV83ODB9KTtcbiAgfVxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtXzc4MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5leHBhbmQodGVybV83ODEuYmxvY2spfSk7XG4gIH1cbiAgZXhwYW5kQmxvY2sodGVybV83ODIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogdGVybV83ODIuc3RhdGVtZW50cy5tYXAoc183ODMgPT4gdGhpcy5leHBhbmQoc183ODMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50KHRlcm1fNzg0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fNzg0LmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZFJldHVyblN0YXRlbWVudCh0ZXJtXzc4NSkge1xuICAgIGlmICh0ZXJtXzc4NS5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXJtXzc4NTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc4NS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRGVjbGFyYXRpb24odGVybV83ODYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0RlY2xhcmF0aW9uXCIsIHtuYW1lOiB0ZXJtXzc4Ni5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODYubmFtZSksIHN1cGVyOiB0ZXJtXzc4Ni5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzg2LnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fNzg2LmVsZW1lbnRzLm1hcChlbF83ODcgPT4gdGhpcy5leHBhbmQoZWxfNzg3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFeHByZXNzaW9uKHRlcm1fNzg4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFeHByZXNzaW9uXCIsIHtuYW1lOiB0ZXJtXzc4OC5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODgubmFtZSksIHN1cGVyOiB0ZXJtXzc4OC5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzg4LnN1cGVyKSwgZWxlbWVudHM6IHRlcm1fNzg4LmVsZW1lbnRzLm1hcChlbF83ODkgPT4gdGhpcy5leHBhbmQoZWxfNzg5KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFbGVtZW50KHRlcm1fNzkwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogdGVybV83OTAuaXNTdGF0aWMsIG1ldGhvZDogdGhpcy5leHBhbmQodGVybV83OTAubWV0aG9kKX0pO1xuICB9XG4gIGV4cGFuZFRoaXNFeHByZXNzaW9uKHRlcm1fNzkxKSB7XG4gICAgcmV0dXJuIHRlcm1fNzkxO1xuICB9XG4gIGV4cGFuZFN5bnRheFRlbXBsYXRlKHRlcm1fNzkyKSB7XG4gICAgbGV0IGV4cGFuZGVyXzc5MyA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCByXzc5NCA9IHByb2Nlc3NUZW1wbGF0ZSh0ZXJtXzc5Mi50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzc5NSA9IFN5bnRheC5mcm9tU3RyaW5nKHNlcmlhbGl6ZXIud3JpdGUocl83OTQudGVtcGxhdGUpKTtcbiAgICBsZXQgY2FsbGVlXzc5NiA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc183OTcgPSByXzc5NC5pbnRlcnAubWFwKGlfNzk5ID0+IHtcbiAgICAgIGxldCBlbmZfODAwID0gbmV3IEVuZm9yZXN0ZXIoaV83OTksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZChlbmZfODAwLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKSk7XG4gICAgfSk7XG4gICAgbGV0IGFyZ3NfNzk4ID0gTGlzdC5vZihuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogc3RyXzc5NX0pKS5jb25jYXQoZXhwYW5kZWRJbnRlcnBzXzc5Nyk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzc5NiwgYXJndW1lbnRzOiBhcmdzXzc5OH0pO1xuICB9XG4gIGV4cGFuZFN5bnRheFF1b3RlKHRlcm1fODAxKSB7XG4gICAgbGV0IHN0cl84MDIgPSBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogU3ludGF4LmZyb21TdHJpbmcoc2VyaWFsaXplci53cml0ZSh0ZXJtXzgwMS5uYW1lKSl9KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGVybV84MDEudGVtcGxhdGUudGFnLCBlbGVtZW50czogdGVybV84MDEudGVtcGxhdGUuZWxlbWVudHMucHVzaChzdHJfODAyKS5wdXNoKG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogXCJcIn0pKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdGF0aWNNZW1iZXJFeHByZXNzaW9uKHRlcm1fODAzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzgwMy5vYmplY3QpLCBwcm9wZXJ0eTogdGVybV84MDMucHJvcGVydHl9KTtcbiAgfVxuICBleHBhbmRBcnJheUV4cHJlc3Npb24odGVybV84MDQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiB0ZXJtXzgwNC5lbGVtZW50cy5tYXAodF84MDUgPT4gdF84MDUgPT0gbnVsbCA/IHRfODA1IDogdGhpcy5leHBhbmQodF84MDUpKX0pO1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzgwNikge1xuICAgIHJldHVybiB0ZXJtXzgwNjtcbiAgfVxuICBleHBhbmRJbXBvcnROYW1lc3BhY2UodGVybV84MDcpIHtcbiAgICByZXR1cm4gdGVybV84MDc7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fODA4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV84MDguZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RGVmYXVsdCh0ZXJtXzgwOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fODA5LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtXzgxMCkge1xuICAgIHJldHVybiB0ZXJtXzgxMDtcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fODExKSB7XG4gICAgcmV0dXJuIHRlcm1fODExO1xuICB9XG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtXzgxMikge1xuICAgIHJldHVybiB0ZXJtXzgxMjtcbiAgfVxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybV84MTMpIHtcbiAgICByZXR1cm4gdGVybV84MTM7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fODE0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzgxNC5uYW1lKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84MTQuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fODE1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogdGVybV84MTUucHJvcGVydGllcy5tYXAodF84MTYgPT4gdGhpcy5leHBhbmQodF84MTYpKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRvcih0ZXJtXzgxNykge1xuICAgIGxldCBpbml0XzgxOCA9IHRlcm1fODE3LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzgxNy5pbml0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fODE3LmJpbmRpbmcpLCBpbml0OiBpbml0XzgxOH0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb24odGVybV84MTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiB0ZXJtXzgxOS5raW5kLCBkZWNsYXJhdG9yczogdGVybV84MTkuZGVjbGFyYXRvcnMubWFwKGRfODIwID0+IHRoaXMuZXhwYW5kKGRfODIwKSl9KTtcbiAgfVxuICBleHBhbmRQYXJlbnRoZXNpemVkRXhwcmVzc2lvbih0ZXJtXzgyMSkge1xuICAgIGlmICh0ZXJtXzgyMS5pbm5lci5zaXplID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIGVuZCBvZiBpbnB1dFwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl84MjIgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzgyMS5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfODIzID0gZW5mXzgyMi5wZWVrKCk7XG4gICAgbGV0IHRfODI0ID0gZW5mXzgyMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodF84MjQgPT0gbnVsbCB8fCBlbmZfODIyLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZl84MjIuY3JlYXRlRXJyb3IobG9va2FoZWFkXzgyMywgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kKHRfODI0KTtcbiAgfVxuICBleHBhbmRVbmFyeUV4cHJlc3Npb24odGVybV84MjUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVbmFyeUV4cHJlc3Npb25cIiwge29wZXJhdG9yOiB0ZXJtXzgyNS5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV84MjUub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRVcGRhdGVFeHByZXNzaW9uKHRlcm1fODI2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IHRlcm1fODI2LmlzUHJlZml4LCBvcGVyYXRvcjogdGVybV84MjYub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fODI2Lm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kQmluYXJ5RXhwcmVzc2lvbih0ZXJtXzgyNykge1xuICAgIGxldCBsZWZ0XzgyOCA9IHRoaXMuZXhwYW5kKHRlcm1fODI3LmxlZnQpO1xuICAgIGxldCByaWdodF84MjkgPSB0aGlzLmV4cGFuZCh0ZXJtXzgyNy5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF84MjgsIG9wZXJhdG9yOiB0ZXJtXzgyNy5vcGVyYXRvciwgcmlnaHQ6IHJpZ2h0XzgyOX0pO1xuICB9XG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtXzgzMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV84MzAudGVzdCksIGNvbnNlcXVlbnQ6IHRoaXMuZXhwYW5kKHRlcm1fODMwLmNvbnNlcXVlbnQpLCBhbHRlcm5hdGU6IHRoaXMuZXhwYW5kKHRlcm1fODMwLmFsdGVybmF0ZSl9KTtcbiAgfVxuICBleHBhbmROZXdUYXJnZXRFeHByZXNzaW9uKHRlcm1fODMxKSB7XG4gICAgcmV0dXJuIHRlcm1fODMxO1xuICB9XG4gIGV4cGFuZE5ld0V4cHJlc3Npb24odGVybV84MzIpIHtcbiAgICBsZXQgY2FsbGVlXzgzMyA9IHRoaXMuZXhwYW5kKHRlcm1fODMyLmNhbGxlZSk7XG4gICAgbGV0IGVuZl84MzQgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzgzMi5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc184MzUgPSBlbmZfODM0LmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ184MzYgPT4gdGhpcy5leHBhbmQoYXJnXzgzNikpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzgzMywgYXJndW1lbnRzOiBhcmdzXzgzNS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdXBlcih0ZXJtXzgzNykge1xuICAgIHJldHVybiB0ZXJtXzgzNztcbiAgfVxuICBleHBhbmRDYWxsRXhwcmVzc2lvbih0ZXJtXzgzOCkge1xuICAgIGxldCBjYWxsZWVfODM5ID0gdGhpcy5leHBhbmQodGVybV84MzguY2FsbGVlKTtcbiAgICBsZXQgZW5mXzg0MCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODM4LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzg0MSA9IGVuZl84NDAuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzg0MiA9PiB0aGlzLmV4cGFuZChhcmdfODQyKSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzgzOSwgYXJndW1lbnRzOiBhcmdzXzg0MX0pO1xuICB9XG4gIGV4cGFuZFNwcmVhZEVsZW1lbnQodGVybV84NDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzg0My5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cHJlc3Npb25TdGF0ZW1lbnQodGVybV84NDQpIHtcbiAgICBsZXQgY2hpbGRfODQ1ID0gdGhpcy5leHBhbmQodGVybV84NDQuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogY2hpbGRfODQ1fSk7XG4gIH1cbiAgZXhwYW5kTGFiZWxlZFN0YXRlbWVudCh0ZXJtXzg0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxhYmVsZWRTdGF0ZW1lbnRcIiwge2xhYmVsOiB0ZXJtXzg0Ni5sYWJlbC52YWwoKSwgYm9keTogdGhpcy5leHBhbmQodGVybV84NDYuYm9keSl9KTtcbiAgfVxuICBkb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODQ3LCB0eXBlXzg0OCkge1xuICAgIGxldCBzY29wZV84NDkgPSBmcmVzaFNjb3BlKFwiZnVuXCIpO1xuICAgIGxldCByZWRfODUwID0gbmV3IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIoc2NvcGVfODQ5LCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwYXJhbXNfODUxO1xuICAgIGlmICh0eXBlXzg0OCAhPT0gXCJHZXR0ZXJcIiAmJiB0eXBlXzg0OCAhPT0gXCJTZXR0ZXJcIikge1xuICAgICAgcGFyYW1zXzg1MSA9IHJlZF84NTAudHJhbnNmb3JtKHRlcm1fODQ3LnBhcmFtcyk7XG4gICAgICBwYXJhbXNfODUxID0gdGhpcy5leHBhbmQocGFyYW1zXzg1MSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucHVzaChzY29wZV84NDkpO1xuICAgIGxldCBleHBhbmRlcl84NTIgPSBuZXcgRXhwYW5kZXIodGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbWFya2VkQm9keV84NTMsIGJvZHlUZXJtXzg1NDtcbiAgICBpZiAodGVybV84NDcuYm9keSBpbnN0YW5jZW9mIFRlcm0pIHtcbiAgICAgIGJvZHlUZXJtXzg1NCA9IHRoaXMuZXhwYW5kKHRlcm1fODQ3LmJvZHkuYWRkU2NvcGUoc2NvcGVfODQ5LCB0aGlzLmNvbnRleHQuYmluZGluZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya2VkQm9keV84NTMgPSB0ZXJtXzg0Ny5ib2R5Lm1hcChiXzg1NSA9PiBiXzg1NS5hZGRTY29wZShzY29wZV84NDksIHRoaXMuY29udGV4dC5iaW5kaW5ncykpO1xuICAgICAgYm9keVRlcm1fODU0ID0gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IExpc3QoKSwgc3RhdGVtZW50czogZXhwYW5kZXJfODUyLmV4cGFuZChtYXJrZWRCb2R5Xzg1Myl9KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wb3AoKTtcbiAgICBpZiAodHlwZV84NDggPT09IFwiR2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg0OCwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODQ3Lm5hbWUpLCBib2R5OiBib2R5VGVybV84NTR9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVfODQ4ID09PSBcIlNldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NDgsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzg0Ny5uYW1lKSwgcGFyYW06IHRlcm1fODQ3LnBhcmFtLCBib2R5OiBib2R5VGVybV84NTR9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODQ4LCB7bmFtZTogdGVybV84NDcubmFtZSwgaXNHZW5lcmF0b3I6IHRlcm1fODQ3LmlzR2VuZXJhdG9yLCBwYXJhbXM6IHBhcmFtc184NTEsIGJvZHk6IGJvZHlUZXJtXzg1NH0pO1xuICB9XG4gIGV4cGFuZE1ldGhvZCh0ZXJtXzg1Nikge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTYsIFwiTWV0aG9kXCIpO1xuICB9XG4gIGV4cGFuZFNldHRlcih0ZXJtXzg1Nykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTcsIFwiU2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEdldHRlcih0ZXJtXzg1OCkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTgsIFwiR2V0dGVyXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybV84NTkpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODU5LCBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25FeHByZXNzaW9uKHRlcm1fODYwKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg2MCwgXCJGdW5jdGlvbkV4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzg2MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fODYxLmJpbmRpbmcpLCBvcGVyYXRvcjogdGVybV84NjEub3BlcmF0b3IsIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODYxLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV84NjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84NjIuYmluZGluZyksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODYyLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRW1wdHlTdGF0ZW1lbnQodGVybV84NjMpIHtcbiAgICByZXR1cm4gdGVybV84NjM7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uKHRlcm1fODY0KSB7XG4gICAgcmV0dXJuIHRlcm1fODY0O1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdW1lcmljRXhwcmVzc2lvbih0ZXJtXzg2NSkge1xuICAgIHJldHVybiB0ZXJtXzg2NTtcbiAgfVxuICBleHBhbmRMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uKHRlcm1fODY2KSB7XG4gICAgcmV0dXJuIHRlcm1fODY2O1xuICB9XG4gIGV4cGFuZElkZW50aWZpZXJFeHByZXNzaW9uKHRlcm1fODY3KSB7XG4gICAgbGV0IHRyYW5zXzg2OCA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fODY3Lm5hbWUucmVzb2x2ZSgpKTtcbiAgICBpZiAodHJhbnNfODY4KSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdHJhbnNfODY4LmlkfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtXzg2NztcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVsbEV4cHJlc3Npb24odGVybV84NjkpIHtcbiAgICByZXR1cm4gdGVybV84Njk7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24odGVybV84NzApIHtcbiAgICByZXR1cm4gdGVybV84NzA7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb24odGVybV84NzEpIHtcbiAgICByZXR1cm4gdGVybV84NzE7XG4gIH1cbn1cbiJdfQ==