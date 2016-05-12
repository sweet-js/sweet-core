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
  function TermExpander(context_725) {
    _classCallCheck(this, TermExpander);

    this.context = context_725;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_726) {
      var field_727 = "expand" + term_726.type;
      if (typeof this[field_727] === "function") {
        return this[field_727](term_726);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_726.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_728) {
      return new _terms2.default("TemplateExpression", { tag: term_728.tag == null ? null : this.expand(term_728.tag), elements: term_728.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_729) {
      return new _terms2.default("BreakStatement", { label: term_729.label ? term_729.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_730) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_730.body), test: this.expand(term_730.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_731) {
      return new _terms2.default("WithStatement", { body: this.expand(term_731.body), object: this.expand(term_731.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_732) {
      return term_732;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_733) {
      return new _terms2.default("ContinueStatement", { label: term_733.label ? term_733.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_734) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_734.discriminant), preDefaultCases: term_734.preDefaultCases.map(function (c_735) {
          return _this.expand(c_735);
        }).toArray(), defaultCase: this.expand(term_734.defaultCase), postDefaultCases: term_734.postDefaultCases.map(function (c_736) {
          return _this.expand(c_736);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_737) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_737.object), expression: this.expand(term_737.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_738) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_738.discriminant), cases: term_738.cases.map(function (c_739) {
          return _this2.expand(c_739);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_740) {
      var _this3 = this;

      var rest_741 = term_740.rest == null ? null : this.expand(term_740.rest);
      return new _terms2.default("FormalParameters", { items: term_740.items.map(function (i_742) {
          return _this3.expand(i_742);
        }), rest: rest_741 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_743) {
      return this.doFunctionExpansion(term_743, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_744) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_744.consequent.map(function (c_745) {
          return _this4.expand(c_745);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_746) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_746.test), consequent: term_746.consequent.map(function (c_747) {
          return _this5.expand(c_747);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_748) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_748.left), right: this.expand(term_748.right), body: this.expand(term_748.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_749) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_749.body), catchClause: this.expand(term_749.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_750) {
      var catchClause_751 = term_750.catchClause == null ? null : this.expand(term_750.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_750.body), catchClause: catchClause_751, finalizer: this.expand(term_750.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_752) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_752.binding), body: this.expand(term_752.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_753) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_753.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_754) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_754.left), right: this.expand(term_754.right), body: this.expand(term_754.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_755) {
      return term_755;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_756) {
      return term_756;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_757) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_757.name), binding: this.expand(term_757.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_758) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_758.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_759) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_759.properties.map(function (t_760) {
          return _this6.expand(t_760);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_761) {
      var _this7 = this;

      var restElement_762 = term_761.restElement == null ? null : this.expand(term_761.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_761.elements.map(function (t_763) {
          return t_763 == null ? null : _this7.expand(t_763);
        }).toArray(), restElement: restElement_762 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_764) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_764.binding), init: this.expand(term_764.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_765) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_765.name }), expression: new _terms2.default("IdentifierExpression", { name: term_765.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_766) {
      var init_767 = term_766.init == null ? null : this.expand(term_766.init);
      var test_768 = term_766.test == null ? null : this.expand(term_766.test);
      var update_769 = term_766.update == null ? null : this.expand(term_766.update);
      var body_770 = this.expand(term_766.body);
      return new _terms2.default("ForStatement", { init: init_767, test: test_768, update: update_769, body: body_770 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_771) {
      var expr_772 = term_771.expression == null ? null : this.expand(term_771.expression);
      return new _terms2.default("YieldExpression", { expression: expr_772 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_773) {
      var expr_774 = term_773.expression == null ? null : this.expand(term_773.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_774 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_775) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_775.test), body: this.expand(term_775.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_776) {
      var consequent_777 = term_776.consequent == null ? null : this.expand(term_776.consequent);
      var alternate_778 = term_776.alternate == null ? null : this.expand(term_776.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_776.test), consequent: consequent_777, alternate: alternate_778 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_779) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_779.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_780) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_780.statements.map(function (s_781) {
          return _this8.expand(s_781);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_782) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_782.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_783) {
      if (term_783.expression == null) {
        return term_783;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_783.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_784) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_784.name == null ? null : this.expand(term_784.name), super: term_784.super == null ? null : this.expand(term_784.super), elements: term_784.elements.map(function (el_785) {
          return _this9.expand(el_785);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_786) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_786.name == null ? null : this.expand(term_786.name), super: term_786.super == null ? null : this.expand(term_786.super), elements: term_786.elements.map(function (el_787) {
          return _this10.expand(el_787);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_788) {
      return new _terms2.default("ClassElement", { isStatic: term_788.isStatic, method: this.expand(term_788.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_789) {
      return term_789;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_790) {
      var _this11 = this;

      var expander_791 = new _expander2.default(this.context);
      var r_792 = (0, _templateProcessor.processTemplate)(term_790.template.inner());
      var str_793 = _syntax2.default.fromString(_serializer.serializer.write(r_792.template));
      var callee_794 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_795 = r_792.interp.map(function (i_797) {
        var enf_798 = new _enforester.Enforester(i_797, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_798.enforest("expression"));
      });
      var args_796 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_793 })).concat(expandedInterps_795);
      return new _terms2.default("CallExpression", { callee: callee_794, arguments: args_796 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_799) {
      var str_800 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_799.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_799.template.tag, elements: term_799.template.elements.push(str_800).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_801) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_801.object), property: term_801.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_802) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_802.elements.map(function (t_803) {
          return t_803 == null ? t_803 : _this12.expand(t_803);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_804) {
      return term_804;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_805) {
      return term_805;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_806) {
      return new _terms2.default("Export", { declaration: this.expand(term_806.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_807) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_807.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_808) {
      return term_808;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_809) {
      return term_809;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_810) {
      return term_810;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_811) {
      return term_811;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_812) {
      return new _terms2.default("DataProperty", { name: this.expand(term_812.name), expression: this.expand(term_812.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_813) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_813.properties.map(function (t_814) {
          return _this13.expand(t_814);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_815) {
      var init_816 = term_815.init == null ? null : this.expand(term_815.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_815.binding), init: init_816 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_817) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_817.kind, declarators: term_817.declarators.map(function (d_818) {
          return _this14.expand(d_818);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_819) {
      if (term_819.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_820 = new _enforester.Enforester(term_819.inner, (0, _immutable.List)(), this.context);
      var lookahead_821 = enf_820.peek();
      var t_822 = enf_820.enforestExpression();
      if (t_822 == null || enf_820.rest.size > 0) {
        throw enf_820.createError(lookahead_821, "unexpected syntax");
      }
      return this.expand(t_822);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_823) {
      return new _terms2.default("UnaryExpression", { operator: term_823.operator, operand: this.expand(term_823.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_824) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_824.isPrefix, operator: term_824.operator, operand: this.expand(term_824.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_825) {
      var left_826 = this.expand(term_825.left);
      var right_827 = this.expand(term_825.right);
      return new _terms2.default("BinaryExpression", { left: left_826, operator: term_825.operator, right: right_827 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_828) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_828.test), consequent: this.expand(term_828.consequent), alternate: this.expand(term_828.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_829) {
      return term_829;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_830) {
      var _this15 = this;

      var callee_831 = this.expand(term_830.callee);
      var enf_832 = new _enforester.Enforester(term_830.arguments, (0, _immutable.List)(), this.context);
      var args_833 = enf_832.enforestArgumentList().map(function (arg_834) {
        return _this15.expand(arg_834);
      });
      return new _terms2.default("NewExpression", { callee: callee_831, arguments: args_833.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_835) {
      return term_835;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_836) {
      var _this16 = this;

      var callee_837 = this.expand(term_836.callee);
      var enf_838 = new _enforester.Enforester(term_836.arguments, (0, _immutable.List)(), this.context);
      var args_839 = enf_838.enforestArgumentList().map(function (arg_840) {
        return _this16.expand(arg_840);
      });
      return new _terms2.default("CallExpression", { callee: callee_837, arguments: args_839 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_841) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_841.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_842) {
      var child_843 = this.expand(term_842.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_843 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_844) {
      return new _terms2.default("LabeledStatement", { label: term_844.label.val(), body: this.expand(term_844.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_845, type_846) {
      var _this17 = this;

      var scope_847 = (0, _scope.freshScope)("fun");
      var red_848 = new _applyScopeInParamsReducer2.default(scope_847, this.context);
      var params_849 = void 0;
      if (type_846 !== "Getter" && type_846 !== "Setter") {
        params_849 = red_848.transform(term_845.params);
        params_849 = this.expand(params_849);
      }
      this.context.currentScope.push(scope_847);
      var expander_850 = new _expander2.default(this.context);
      var markedBody_851 = void 0,
          bodyTerm_852 = void 0;
      if (term_845.body instanceof _terms2.default) {
        bodyTerm_852 = this.expand(term_845.body.addScope(scope_847, this.context.bindings));
      } else {
        markedBody_851 = term_845.body.map(function (b_853) {
          return b_853.addScope(scope_847, _this17.context.bindings);
        });
        bodyTerm_852 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_850.expand(markedBody_851) });
      }
      this.context.currentScope.pop();
      if (type_846 === "Getter") {
        return new _terms2.default(type_846, { name: this.expand(term_845.name), body: bodyTerm_852 });
      } else if (type_846 === "Setter") {
        return new _terms2.default(type_846, { name: this.expand(term_845.name), param: term_845.param, body: bodyTerm_852 });
      }
      return new _terms2.default(type_846, { name: term_845.name, isGenerator: term_845.isGenerator, params: params_849, body: bodyTerm_852 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_854) {
      return this.doFunctionExpansion(term_854, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_855) {
      return this.doFunctionExpansion(term_855, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_856) {
      return this.doFunctionExpansion(term_856, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_857) {
      return this.doFunctionExpansion(term_857, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_858) {
      return this.doFunctionExpansion(term_858, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_859) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_859.binding), operator: term_859.operator, expression: this.expand(term_859.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_860) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_860.binding), expression: this.expand(term_860.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_861) {
      return term_861;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_862) {
      return term_862;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_863) {
      return term_863;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_864) {
      return term_864;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_865) {
      var trans_866 = this.context.env.get(term_865.name.resolve());
      if (trans_866) {
        return new _terms2.default("IdentifierExpression", { name: trans_866.id });
      }
      return term_865;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_867) {
      return term_867;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_868) {
      return term_868;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_869) {
      return term_869;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztJQUNxQixZO0FBQ25CLHdCQUFZLFdBQVosRUFBeUI7QUFBQTs7QUFDdkIsU0FBSyxPQUFMLEdBQWUsV0FBZjtBQUNEOzs7OzJCQUNNLFEsRUFBVTtBQUNmLFVBQUksWUFBWSxXQUFXLFNBQVMsSUFBcEM7QUFDQSxVQUFJLE9BQU8sS0FBSyxTQUFMLENBQVAsS0FBMkIsVUFBL0IsRUFBMkM7QUFDekMsZUFBTyxLQUFLLFNBQUwsRUFBZ0IsUUFBaEIsQ0FBUDtBQUNEO0FBQ0QsMEJBQU8sS0FBUCxFQUFjLHFDQUFxQyxTQUFTLElBQTVEO0FBQ0Q7Ozs2Q0FDd0IsUSxFQUFVO0FBQ2pDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQXJCLENBQXBDLEVBQStELFVBQVUsU0FBUyxRQUFULENBQWtCLE9BQWxCLEVBQXpFLEVBQS9CLENBQVA7QUFDRDs7O3lDQUNvQixRLEVBQVU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sU0FBUyxLQUFULEdBQWlCLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBakIsR0FBd0MsSUFBaEQsRUFBM0IsQ0FBUDtBQUNEOzs7MkNBQ3NCLFEsRUFBVTtBQUMvQixhQUFPLG9CQUFTLGtCQUFULEVBQTZCLEVBQUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQVAsRUFBbUMsTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFTLElBQXJCLENBQXpDLEVBQTdCLENBQVA7QUFDRDs7O3dDQUNtQixRLEVBQVU7QUFDNUIsYUFBTyxvQkFBUyxl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SyxNQUFMLENBQVksU0FBUyxVQUFyQixDQUFsRixFQUF6QyxDQUFQO0FBQ0Q7OzsrQ0FDMEIsUSxFQUFVO0FBQ25DLGFBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxTQUFTLEtBQUssTUFBTCxDQUFZLFNBQVMsT0FBckIsQ0FBVixFQUF5QyxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQVMsVUFBckIsQ0FBckQsRUFBakMsQ0FBUDtBQUNEOzs7eUNBQ29CLFEsRUFBVTtBQUM3QixhQUFPLFFBQVA7QUFDRDs7O21EQUM4QixRLEVBQVU7QUFDdkMsYUFBTyxRQUFQO0FBQ0Q7OzttREFDOEIsUSxFQUFVO0FBQ3ZDLGFBQU8sUUFBUDtBQUNEOzs7b0RBQytCLFEsRUFBVTtBQUN4QyxhQUFPLFFBQVA7QUFDRDs7OytDQUMwQixRLEVBQVU7QUFDbkMsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxJQUFULENBQWMsT0FBZCxFQUFyQixDQUFoQjtBQUNBLFVBQUksU0FBSixFQUFlO0FBQ2IsZUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sVUFBVSxFQUFqQixFQUFqQyxDQUFQO0FBQ0Q7QUFDRCxhQUFPLFFBQVA7QUFDRDs7O2dEQUMyQixRLEVBQVU7QUFDcEMsYUFBTyxRQUFQO0FBQ0Q7OztrREFDNkIsUSxFQUFVO0FBQ3RDLGFBQU8sUUFBUDtBQUNEOzs7a0RBQzZCLFEsRUFBVTtBQUN0QyxhQUFPLFFBQVA7QUFDRDs7Ozs7O2tCQTNVa0IsWSIsImZpbGUiOiJ0ZXJtLWV4cGFuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyIGZyb20gXCIuL2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciwge01vbm9pZGFsUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1FeHBhbmRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfNzI1KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF83MjU7XG4gIH1cbiAgZXhwYW5kKHRlcm1fNzI2KSB7XG4gICAgbGV0IGZpZWxkXzcyNyA9IFwiZXhwYW5kXCIgKyB0ZXJtXzcyNi50eXBlO1xuICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF83MjddID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzcyN10odGVybV83MjYpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwiZXhwYW5kIG5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIHRlcm1fNzI2LnR5cGUpO1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzcyOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzcyOC50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzcyOC50YWcpLCBlbGVtZW50czogdGVybV83MjguZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV83MjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzI5LmxhYmVsID8gdGVybV83MjkubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzczMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzMwLmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzczMC50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV83MzEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzczMS5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzczMS5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV83MzIpIHtcbiAgICByZXR1cm4gdGVybV83MzI7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV83MzMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNzMzLmxhYmVsID8gdGVybV83MzMubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV83MzQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzczNC5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fNzM0LnByZURlZmF1bHRDYXNlcy5tYXAoY183MzUgPT4gdGhpcy5leHBhbmQoY183MzUpKS50b0FycmF5KCksIGRlZmF1bHRDYXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzczNC5kZWZhdWx0Q2FzZSksIHBvc3REZWZhdWx0Q2FzZXM6IHRlcm1fNzM0LnBvc3REZWZhdWx0Q2FzZXMubWFwKGNfNzM2ID0+IHRoaXMuZXhwYW5kKGNfNzM2KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKHRlcm1fNzM3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzM3Lm9iamVjdCksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzM3LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50KHRlcm1fNzM4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzM4LmRpc2NyaW1pbmFudCksIGNhc2VzOiB0ZXJtXzczOC5jYXNlcy5tYXAoY183MzkgPT4gdGhpcy5leHBhbmQoY183MzkpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fNzQwKSB7XG4gICAgbGV0IHJlc3RfNzQxID0gdGVybV83NDAucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzQwLnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzc0MC5pdGVtcy5tYXAoaV83NDIgPT4gdGhpcy5leHBhbmQoaV83NDIpKSwgcmVzdDogcmVzdF83NDF9KTtcbiAgfVxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybV83NDMpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fNzQzLCBcIkFycm93RXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRTd2l0Y2hEZWZhdWx0KHRlcm1fNzQ0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGVybV83NDQuY29uc2VxdWVudC5tYXAoY183NDUgPT4gdGhpcy5leHBhbmQoY183NDUpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hDYXNlKHRlcm1fNzQ2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83NDYudGVzdCksIGNvbnNlcXVlbnQ6IHRlcm1fNzQ2LmNvbnNlcXVlbnQubWFwKGNfNzQ3ID0+IHRoaXMuZXhwYW5kKGNfNzQ3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV83NDgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV83NDgubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0OC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzQ4LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV83NDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83NDkuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzc0OS5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fNzUwKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzc1MSA9IHRlcm1fNzUwLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NTAuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzUwLmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfNzUxLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fNzUwLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzc1Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzc1Mi5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NTIuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzc1Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc1My5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fNzU0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzU0LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV83NTQucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc1NC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fNzU1KSB7XG4gICAgcmV0dXJuIHRlcm1fNzU1O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV83NTYpIHtcbiAgICByZXR1cm4gdGVybV83NTY7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV83NTcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV83NTcubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzU3LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV83NTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NTguZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fNzU5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV83NTkucHJvcGVydGllcy5tYXAodF83NjAgPT4gdGhpcy5leHBhbmQodF83NjApKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRBcnJheUJpbmRpbmcodGVybV83NjEpIHtcbiAgICBsZXQgcmVzdEVsZW1lbnRfNzYyID0gdGVybV83NjEucmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2MS5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV83NjEuZWxlbWVudHMubWFwKHRfNzYzID0+IHRfNzYzID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodF83NjMpKS50b0FycmF5KCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF83NjJ9KTtcbiAgfVxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybV83NjQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzY0LmJpbmRpbmcpLCBpbml0OiB0aGlzLmV4cGFuZCh0ZXJtXzc2NC5pbml0KX0pO1xuICB9XG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm1fNzY1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRlcm1fNzY1Lm5hbWV9KSwgZXhwcmVzc2lvbjogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV83NjUubmFtZX0pfSk7XG4gIH1cbiAgZXhwYW5kRm9yU3RhdGVtZW50KHRlcm1fNzY2KSB7XG4gICAgbGV0IGluaXRfNzY3ID0gdGVybV83NjYuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzY2LmluaXQpO1xuICAgIGxldCB0ZXN0Xzc2OCA9IHRlcm1fNzY2LnRlc3QgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2Ni50ZXN0KTtcbiAgICBsZXQgdXBkYXRlXzc2OSA9IHRlcm1fNzY2LnVwZGF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzY2LnVwZGF0ZSk7XG4gICAgbGV0IGJvZHlfNzcwID0gdGhpcy5leHBhbmQodGVybV83NjYuYm9keSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzc2NywgdGVzdDogdGVzdF83NjgsIHVwZGF0ZTogdXBkYXRlXzc2OSwgYm9keTogYm9keV83NzB9KTtcbiAgfVxuICBleHBhbmRZaWVsZEV4cHJlc3Npb24odGVybV83NzEpIHtcbiAgICBsZXQgZXhwcl83NzIgPSB0ZXJtXzc3MS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzEuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzc3Mn0pO1xuICB9XG4gIGV4cGFuZFlpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbih0ZXJtXzc3Mykge1xuICAgIGxldCBleHByXzc3NCA9IHRlcm1fNzczLmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3My5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfNzc0fSk7XG4gIH1cbiAgZXhwYW5kV2hpbGVTdGF0ZW1lbnQodGVybV83NzUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV83NzUudGVzdCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzc1LmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kSWZTdGF0ZW1lbnQodGVybV83NzYpIHtcbiAgICBsZXQgY29uc2VxdWVudF83NzcgPSB0ZXJtXzc3Ni5jb25zZXF1ZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NzYuY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZV83NzggPSB0ZXJtXzc3Ni5hbHRlcm5hdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3Ni5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc3Ni50ZXN0KSwgY29uc2VxdWVudDogY29uc2VxdWVudF83NzcsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzc3OH0pO1xuICB9XG4gIGV4cGFuZEJsb2NrU3RhdGVtZW50KHRlcm1fNzc5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtXzc3OS5ibG9jayl9KTtcbiAgfVxuICBleHBhbmRCbG9jayh0ZXJtXzc4MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiB0ZXJtXzc4MC5zdGF0ZW1lbnRzLm1hcChzXzc4MSA9PiB0aGlzLmV4cGFuZChzXzc4MSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybV83ODIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV83ODIuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kUmV0dXJuU3RhdGVtZW50KHRlcm1fNzgzKSB7XG4gICAgaWYgKHRlcm1fNzgzLmV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlcm1fNzgzO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzgzLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NEZWNsYXJhdGlvbih0ZXJtXzc4NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRGVjbGFyYXRpb25cIiwge25hbWU6IHRlcm1fNzg0Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4NC5uYW1lKSwgc3VwZXI6IHRlcm1fNzg0LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODQuc3VwZXIpLCBlbGVtZW50czogdGVybV83ODQuZWxlbWVudHMubWFwKGVsXzc4NSA9PiB0aGlzLmV4cGFuZChlbF83ODUpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV83ODYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNzg2Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4Ni5uYW1lKSwgc3VwZXI6IHRlcm1fNzg2LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83ODYuc3VwZXIpLCBlbGVtZW50czogdGVybV83ODYuZWxlbWVudHMubWFwKGVsXzc4NyA9PiB0aGlzLmV4cGFuZChlbF83ODcpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0VsZW1lbnQodGVybV83ODgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiB0ZXJtXzc4OC5pc1N0YXRpYywgbWV0aG9kOiB0aGlzLmV4cGFuZCh0ZXJtXzc4OC5tZXRob2QpfSk7XG4gIH1cbiAgZXhwYW5kVGhpc0V4cHJlc3Npb24odGVybV83ODkpIHtcbiAgICByZXR1cm4gdGVybV83ODk7XG4gIH1cbiAgZXhwYW5kU3ludGF4VGVtcGxhdGUodGVybV83OTApIHtcbiAgICBsZXQgZXhwYW5kZXJfNzkxID0gbmV3IEV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJfNzkyID0gcHJvY2Vzc1RlbXBsYXRlKHRlcm1fNzkwLnRlbXBsYXRlLmlubmVyKCkpO1xuICAgIGxldCBzdHJfNzkzID0gU3ludGF4LmZyb21TdHJpbmcoc2VyaWFsaXplci53cml0ZShyXzc5Mi50ZW1wbGF0ZSkpO1xuICAgIGxldCBjYWxsZWVfNzk0ID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwic3ludGF4VGVtcGxhdGVcIil9KTtcbiAgICBsZXQgZXhwYW5kZWRJbnRlcnBzXzc5NSA9IHJfNzkyLmludGVycC5tYXAoaV83OTcgPT4ge1xuICAgICAgbGV0IGVuZl83OTggPSBuZXcgRW5mb3Jlc3RlcihpXzc5NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5kKGVuZl83OTguZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpKTtcbiAgICB9KTtcbiAgICBsZXQgYXJnc183OTYgPSBMaXN0Lm9mKG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBzdHJfNzkzfSkpLmNvbmNhdChleHBhbmRlZEludGVycHNfNzk1KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfNzk0LCBhcmd1bWVudHM6IGFyZ3NfNzk2fSk7XG4gIH1cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybV83OTkpIHtcbiAgICBsZXQgc3RyXzgwMCA9IG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiBTeW50YXguZnJvbVN0cmluZyhzZXJpYWxpemVyLndyaXRlKHRlcm1fNzk5Lm5hbWUpKX0pO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzc5OS50ZW1wbGF0ZS50YWcsIGVsZW1lbnRzOiB0ZXJtXzc5OS50ZW1wbGF0ZS5lbGVtZW50cy5wdXNoKHN0cl84MDApLnB1c2gobmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBcIlwifSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN0YXRpY01lbWJlckV4cHJlc3Npb24odGVybV84MDEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fODAxLm9iamVjdCksIHByb3BlcnR5OiB0ZXJtXzgwMS5wcm9wZXJ0eX0pO1xuICB9XG4gIGV4cGFuZEFycmF5RXhwcmVzc2lvbih0ZXJtXzgwMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHRlcm1fODAyLmVsZW1lbnRzLm1hcCh0XzgwMyA9PiB0XzgwMyA9PSBudWxsID8gdF84MDMgOiB0aGlzLmV4cGFuZCh0XzgwMykpfSk7XG4gIH1cbiAgZXhwYW5kSW1wb3J0KHRlcm1fODA0KSB7XG4gICAgcmV0dXJuIHRlcm1fODA0O1xuICB9XG4gIGV4cGFuZEltcG9ydE5hbWVzcGFjZSh0ZXJtXzgwNSkge1xuICAgIHJldHVybiB0ZXJtXzgwNTtcbiAgfVxuICBleHBhbmRFeHBvcnQodGVybV84MDYpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgwNi5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRFeHBvcnREZWZhdWx0KHRlcm1fODA3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV84MDcuYm9keSl9KTtcbiAgfVxuICBleHBhbmRFeHBvcnRGcm9tKHRlcm1fODA4KSB7XG4gICAgcmV0dXJuIHRlcm1fODA4O1xuICB9XG4gIGV4cGFuZEV4cG9ydEFsbEZyb20odGVybV84MDkpIHtcbiAgICByZXR1cm4gdGVybV84MDk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0U3BlY2lmaWVyKHRlcm1fODEwKSB7XG4gICAgcmV0dXJuIHRlcm1fODEwO1xuICB9XG4gIGV4cGFuZFN0YXRpY1Byb3BlcnR5TmFtZSh0ZXJtXzgxMSkge1xuICAgIHJldHVybiB0ZXJtXzgxMTtcbiAgfVxuICBleHBhbmREYXRhUHJvcGVydHkodGVybV84MTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODEyLm5hbWUpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzgxMi5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEV4cHJlc3Npb24odGVybV84MTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzgxMy5wcm9wZXJ0aWVzLm1hcCh0XzgxNCA9PiB0aGlzLmV4cGFuZCh0XzgxNCkpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdG9yKHRlcm1fODE1KSB7XG4gICAgbGV0IGluaXRfODE2ID0gdGVybV84MTUuaW5pdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fODE1LmluaXQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84MTUuYmluZGluZyksIGluaXQ6IGluaXRfODE2fSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvbih0ZXJtXzgxNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHRlcm1fODE3LmtpbmQsIGRlY2xhcmF0b3JzOiB0ZXJtXzgxNy5kZWNsYXJhdG9ycy5tYXAoZF84MTggPT4gdGhpcy5leHBhbmQoZF84MTgpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fODE5KSB7XG4gICAgaWYgKHRlcm1fODE5LmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzgyMCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODE5LmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF84MjEgPSBlbmZfODIwLnBlZWsoKTtcbiAgICBsZXQgdF84MjIgPSBlbmZfODIwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzgyMiA9PSBudWxsIHx8IGVuZl84MjAucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzgyMC5jcmVhdGVFcnJvcihsb29rYWhlYWRfODIxLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF84MjIpO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzgyMykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fODIzLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMy5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV84MjQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV84MjQuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzgyNC5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV84MjQub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fODI1KSB7XG4gICAgbGV0IGxlZnRfODI2ID0gdGhpcy5leHBhbmQodGVybV84MjUubGVmdCk7XG4gICAgbGV0IHJpZ2h0XzgyNyA9IHRoaXMuZXhwYW5kKHRlcm1fODI1LnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzgyNiwgb3BlcmF0b3I6IHRlcm1fODI1Lm9wZXJhdG9yLCByaWdodDogcmlnaHRfODI3fSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fODI4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzgyOC50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV84MjguY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV84MjguYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV84MjkpIHtcbiAgICByZXR1cm4gdGVybV84Mjk7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzgzMCkge1xuICAgIGxldCBjYWxsZWVfODMxID0gdGhpcy5leHBhbmQodGVybV84MzAuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzgzMiA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fODMwLmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzgzMyA9IGVuZl84MzIuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnXzgzNCA9PiB0aGlzLmV4cGFuZChhcmdfODM0KSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODMxLCBhcmd1bWVudHM6IGFyZ3NfODMzLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN1cGVyKHRlcm1fODM1KSB7XG4gICAgcmV0dXJuIHRlcm1fODM1O1xuICB9XG4gIGV4cGFuZENhbGxFeHByZXNzaW9uKHRlcm1fODM2KSB7XG4gICAgbGV0IGNhbGxlZV84MzcgPSB0aGlzLmV4cGFuZCh0ZXJtXzgzNi5jYWxsZWUpO1xuICAgIGxldCBlbmZfODM4ID0gbmV3IEVuZm9yZXN0ZXIodGVybV84MzYuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfODM5ID0gZW5mXzgzOC5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfODQwID0+IHRoaXMuZXhwYW5kKGFyZ184NDApKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfODM3LCBhcmd1bWVudHM6IGFyZ3NfODM5fSk7XG4gIH1cbiAgZXhwYW5kU3ByZWFkRWxlbWVudCh0ZXJtXzg0MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODQxLmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwcmVzc2lvblN0YXRlbWVudCh0ZXJtXzg0Mikge1xuICAgIGxldCBjaGlsZF84NDMgPSB0aGlzLmV4cGFuZCh0ZXJtXzg0Mi5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBjaGlsZF84NDN9KTtcbiAgfVxuICBleHBhbmRMYWJlbGVkU3RhdGVtZW50KHRlcm1fODQ0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fODQ0LmxhYmVsLnZhbCgpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzg0NC5ib2R5KX0pO1xuICB9XG4gIGRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NDUsIHR5cGVfODQ2KSB7XG4gICAgbGV0IHNjb3BlXzg0NyA9IGZyZXNoU2NvcGUoXCJmdW5cIik7XG4gICAgbGV0IHJlZF84NDggPSBuZXcgQXBwbHlTY29wZUluUGFyYW1zUmVkdWNlcihzY29wZV84NDcsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtc184NDk7XG4gICAgaWYgKHR5cGVfODQ2ICE9PSBcIkdldHRlclwiICYmIHR5cGVfODQ2ICE9PSBcIlNldHRlclwiKSB7XG4gICAgICBwYXJhbXNfODQ5ID0gcmVkXzg0OC50cmFuc2Zvcm0odGVybV84NDUucGFyYW1zKTtcbiAgICAgIHBhcmFtc184NDkgPSB0aGlzLmV4cGFuZChwYXJhbXNfODQ5KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlXzg0Nyk7XG4gICAgbGV0IGV4cGFuZGVyXzg1MCA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCBtYXJrZWRCb2R5Xzg1MSwgYm9keVRlcm1fODUyO1xuICAgIGlmICh0ZXJtXzg0NS5ib2R5IGluc3RhbmNlb2YgVGVybSkge1xuICAgICAgYm9keVRlcm1fODUyID0gdGhpcy5leHBhbmQodGVybV84NDUuYm9keS5hZGRTY29wZShzY29wZV84NDcsIHRoaXMuY29udGV4dC5iaW5kaW5ncykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5Xzg1MSA9IHRlcm1fODQ1LmJvZHkubWFwKGJfODUzID0+IGJfODUzLmFkZFNjb3BlKHNjb3BlXzg0NywgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgICBib2R5VGVybV84NTIgPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBleHBhbmRlcl84NTAuZXhwYW5kKG1hcmtlZEJvZHlfODUxKX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzg0NiA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODQ2LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV84NDUubmFtZSksIGJvZHk6IGJvZHlUZXJtXzg1Mn0pO1xuICAgIH0gZWxzZSBpZiAodHlwZV84NDYgPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg0Niwge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fODQ1Lm5hbWUpLCBwYXJhbTogdGVybV84NDUucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzg1Mn0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NDYsIHtuYW1lOiB0ZXJtXzg0NS5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV84NDUuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzg0OSwgYm9keTogYm9keVRlcm1fODUyfSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fODU0KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg1NCwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fODU1KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg1NSwgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fODU2KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg1NiwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzg1Nykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTcsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV84NTgpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODU4LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fODU5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV84NTkuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzg1OS5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NTkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzg2MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzg2MC5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84NjAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzg2MSkge1xuICAgIHJldHVybiB0ZXJtXzg2MTtcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV84NjIpIHtcbiAgICByZXR1cm4gdGVybV84NjI7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fODYzKSB7XG4gICAgcmV0dXJuIHRlcm1fODYzO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV84NjQpIHtcbiAgICByZXR1cm4gdGVybV84NjQ7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV84NjUpIHtcbiAgICBsZXQgdHJhbnNfODY2ID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV84NjUubmFtZS5yZXNvbHZlKCkpO1xuICAgIGlmICh0cmFuc184NjYpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc184NjYuaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fODY1O1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzg2Nykge1xuICAgIHJldHVybiB0ZXJtXzg2NztcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzg2OCkge1xuICAgIHJldHVybiB0ZXJtXzg2ODtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzg2OSkge1xuICAgIHJldHVybiB0ZXJtXzg2OTtcbiAgfVxufVxuIl19