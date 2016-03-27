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
  function TermExpander(context_721) {
    _classCallCheck(this, TermExpander);

    this.context = context_721;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_722) {
      var field_723 = "expand" + term_722.type;
      if (typeof this[field_723] === "function") {
        return this[field_723](term_722);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_722.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_724) {
      return new _terms2.default("TemplateExpression", { tag: term_724.tag == null ? null : this.expand(term_724.tag), elements: term_724.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_725) {
      return new _terms2.default("BreakStatement", { label: term_725.label ? term_725.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_726) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_726.body), test: this.expand(term_726.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_727) {
      return new _terms2.default("WithStatement", { body: this.expand(term_727.body), object: this.expand(term_727.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_728) {
      return term_728;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_729) {
      return new _terms2.default("ContinueStatement", { label: term_729.label ? term_729.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_730) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_730.discriminant), preDefaultCases: term_730.preDefaultCases.map(function (c_731) {
          return _this.expand(c_731);
        }).toArray(), defaultCase: this.expand(term_730.defaultCase), postDefaultCases: term_730.postDefaultCases.map(function (c_732) {
          return _this.expand(c_732);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_733) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_733.object), expression: this.expand(term_733.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_734) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_734.discriminant), cases: term_734.cases.map(function (c_735) {
          return _this2.expand(c_735);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_736) {
      var _this3 = this;

      var rest_737 = term_736.rest == null ? null : this.expand(term_736.rest);
      return new _terms2.default("FormalParameters", { items: term_736.items.map(function (i_738) {
          return _this3.expand(i_738);
        }), rest: rest_737 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_739) {
      return this.doFunctionExpansion(term_739, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_740) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_740.consequent.map(function (c_741) {
          return _this4.expand(c_741);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_742) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_742.test), consequent: term_742.consequent.map(function (c_743) {
          return _this5.expand(c_743);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_744) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_744.left), right: this.expand(term_744.right), body: this.expand(term_744.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_745) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_745.body), catchClause: this.expand(term_745.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_746) {
      var catchClause_747 = term_746.catchClause == null ? null : this.expand(term_746.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_746.body), catchClause: catchClause_747, finalizer: this.expand(term_746.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_748) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_748.binding), body: this.expand(term_748.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_749) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_749.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_750) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_750.left), right: this.expand(term_750.right), body: this.expand(term_750.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_751) {
      return term_751;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_752) {
      return term_752;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_753) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_753.name), binding: this.expand(term_753.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_754) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_754.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_755) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_755.properties.map(function (t_756) {
          return _this6.expand(t_756);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_757) {
      var _this7 = this;

      var restElement_758 = term_757.restElement == null ? null : this.expand(term_757.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_757.elements.map(function (t_759) {
          return t_759 == null ? null : _this7.expand(t_759);
        }).toArray(), restElement: restElement_758 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_760) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_760.binding), init: this.expand(term_760.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_761) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_761.name }), expression: new _terms2.default("IdentifierExpression", { name: term_761.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_762) {
      var init_763 = term_762.init == null ? null : this.expand(term_762.init);
      var test_764 = term_762.test == null ? null : this.expand(term_762.test);
      var update_765 = term_762.update == null ? null : this.expand(term_762.update);
      var body_766 = this.expand(term_762.body);
      return new _terms2.default("ForStatement", { init: init_763, test: test_764, update: update_765, body: body_766 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_767) {
      var expr_768 = term_767.expression == null ? null : this.expand(term_767.expression);
      return new _terms2.default("YieldExpression", { expression: expr_768 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_769) {
      var expr_770 = term_769.expression == null ? null : this.expand(term_769.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_770 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_771) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_771.test), body: this.expand(term_771.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_772) {
      var consequent_773 = term_772.consequent == null ? null : this.expand(term_772.consequent);
      var alternate_774 = term_772.alternate == null ? null : this.expand(term_772.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_772.test), consequent: consequent_773, alternate: alternate_774 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_775) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_775.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_776) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_776.statements.map(function (s_777) {
          return _this8.expand(s_777);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_778) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_778.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_779) {
      if (term_779.expression == null) {
        return term_779;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_779.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_780) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_780.name == null ? null : this.expand(term_780.name), super: term_780.super == null ? null : this.expand(term_780.super), elements: term_780.elements.map(function (el_781) {
          return _this9.expand(el_781);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_782) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_782.name == null ? null : this.expand(term_782.name), super: term_782.super == null ? null : this.expand(term_782.super), elements: term_782.elements.map(function (el_783) {
          return _this10.expand(el_783);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_784) {
      return new _terms2.default("ClassElement", { isStatic: term_784.isStatic, method: this.expand(term_784.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_785) {
      return term_785;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_786) {
      var _this11 = this;

      var expander_787 = new _expander2.default(this.context);
      var r_788 = (0, _templateProcessor.processTemplate)(term_786.template.inner());
      var str_789 = _syntax2.default.fromString(_serializer.serializer.write(r_788.template));
      var callee_790 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_791 = r_788.interp.map(function (i_793) {
        var enf_794 = new _enforester.Enforester(i_793, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_794.enforest("expression"));
      });
      var args_792 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_789 })).concat(expandedInterps_791);
      return new _terms2.default("CallExpression", { callee: callee_790, arguments: args_792 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_795) {
      var str_796 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_795.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_795.template.tag, elements: term_795.template.elements.push(str_796).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_797) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_797.object), property: term_797.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_798) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_798.elements.map(function (t_799) {
          return t_799 == null ? t_799 : _this12.expand(t_799);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_800) {
      return term_800;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_801) {
      return term_801;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_802) {
      return new _terms2.default("Export", { declaration: this.expand(term_802.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_803) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_803.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_804) {
      return term_804;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_805) {
      return term_805;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_806) {
      return term_806;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_807) {
      return term_807;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_808) {
      return new _terms2.default("DataProperty", { name: this.expand(term_808.name), expression: this.expand(term_808.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_809) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_809.properties.map(function (t_810) {
          return _this13.expand(t_810);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_811) {
      var init_812 = term_811.init == null ? null : this.expand(term_811.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_811.binding), init: init_812 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_813) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_813.kind, declarators: term_813.declarators.map(function (d_814) {
          return _this14.expand(d_814);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_815) {
      if (term_815.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_816 = new _enforester.Enforester(term_815.inner, (0, _immutable.List)(), this.context);
      var lookahead_817 = enf_816.peek();
      var t_818 = enf_816.enforestExpression();
      if (t_818 == null || enf_816.rest.size > 0) {
        throw enf_816.createError(lookahead_817, "unexpected syntax");
      }
      return this.expand(t_818);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_819) {
      return new _terms2.default("UnaryExpression", { operator: term_819.operator, operand: this.expand(term_819.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_820) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_820.isPrefix, operator: term_820.operator, operand: this.expand(term_820.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_821) {
      var left_822 = this.expand(term_821.left);
      var right_823 = this.expand(term_821.right);
      return new _terms2.default("BinaryExpression", { left: left_822, operator: term_821.operator, right: right_823 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_824) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_824.test), consequent: this.expand(term_824.consequent), alternate: this.expand(term_824.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_825) {
      return term_825;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_826) {
      var _this15 = this;

      var callee_827 = this.expand(term_826.callee);
      var enf_828 = new _enforester.Enforester(term_826.arguments, (0, _immutable.List)(), this.context);
      var args_829 = enf_828.enforestArgumentList().map(function (arg_830) {
        return _this15.expand(arg_830);
      });
      return new _terms2.default("NewExpression", { callee: callee_827, arguments: args_829.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_831) {
      return term_831;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_832) {
      var _this16 = this;

      var callee_833 = this.expand(term_832.callee);
      var enf_834 = new _enforester.Enforester(term_832.arguments, (0, _immutable.List)(), this.context);
      var args_835 = enf_834.enforestArgumentList().map(function (arg_836) {
        return _this16.expand(arg_836);
      });
      return new _terms2.default("CallExpression", { callee: callee_833, arguments: args_835 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_837) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_837.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_838) {
      var child_839 = this.expand(term_838.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_839 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_840) {
      return new _terms2.default("LabeledStatement", { label: term_840.label.val(), body: this.expand(term_840.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_841, type_842) {
      var _this17 = this;

      var scope_843 = (0, _scope.freshScope)("fun");
      var red_844 = new _applyScopeInParamsReducer2.default(scope_843, this.context);
      var params_845 = void 0;
      if (type_842 !== "Getter" && type_842 !== "Setter") {
        params_845 = red_844.transform(term_841.params);
        params_845 = this.expand(params_845);
      }
      this.context.currentScope.push(scope_843);
      var expander_846 = new _expander2.default(this.context);
      var markedBody_847 = void 0,
          bodyTerm_848 = void 0;
      if (term_841.body instanceof _terms2.default) {
        bodyTerm_848 = this.expand(term_841.body.addScope(scope_843, this.context.bindings));
      } else {
        markedBody_847 = term_841.body.map(function (b_849) {
          return b_849.addScope(scope_843, _this17.context.bindings);
        });
        bodyTerm_848 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_846.expand(markedBody_847) });
      }
      this.context.currentScope.pop();
      if (type_842 === "Getter") {
        return new _terms2.default(type_842, { name: this.expand(term_841.name), body: bodyTerm_848 });
      } else if (type_842 === "Setter") {
        return new _terms2.default(type_842, { name: this.expand(term_841.name), param: term_841.param, body: bodyTerm_848 });
      }
      return new _terms2.default(type_842, { name: term_841.name, isGenerator: term_841.isGenerator, params: params_845, body: bodyTerm_848 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_850) {
      return this.doFunctionExpansion(term_850, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_851) {
      return this.doFunctionExpansion(term_851, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_852) {
      return this.doFunctionExpansion(term_852, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_853) {
      return this.doFunctionExpansion(term_853, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_854) {
      return this.doFunctionExpansion(term_854, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_855) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_855.binding), operator: term_855.operator, expression: this.expand(term_855.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_856) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_856.binding), expression: this.expand(term_856.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_857) {
      return term_857;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_858) {
      return term_858;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_859) {
      return term_859;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_860) {
      return term_860;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_861) {
      var trans_862 = this.context.env.get(term_861.name.resolve());
      if (trans_862) {
        return new _terms2.default("IdentifierExpression", { name: trans_862.id });
      }
      return term_861;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_863) {
      return term_863;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_864) {
      return term_864;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_865) {
      return term_865;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztJQUNxQjtBQUNuQixXQURtQixZQUNuQixDQUFZLFdBQVosRUFBeUI7MEJBRE4sY0FDTTs7QUFDdkIsU0FBSyxPQUFMLEdBQWUsV0FBZixDQUR1QjtHQUF6Qjs7ZUFEbUI7OzJCQUlaLFVBQVU7QUFDZixVQUFJLFlBQVksV0FBVyxTQUFTLElBQVQsQ0FEWjtBQUVmLFVBQUksT0FBTyxLQUFLLFNBQUwsQ0FBUCxLQUEyQixVQUEzQixFQUF1QztBQUN6QyxlQUFPLEtBQUssU0FBTCxFQUFnQixRQUFoQixDQUFQLENBRHlDO09BQTNDO0FBR0EsMEJBQU8sS0FBUCxFQUFjLHFDQUFxQyxTQUFTLElBQVQsQ0FBbkQsQ0FMZTs7Ozs2Q0FPUSxVQUFVO0FBQ2pDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQVQsQ0FBMUMsRUFBeUQsVUFBVSxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBVixFQUE5RixDQUFQLENBRGlDOzs7O3lDQUdkLFVBQVU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sU0FBUyxLQUFULEdBQWlCLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBakIsR0FBd0MsSUFBeEMsRUFBbkMsQ0FBUCxDQUQ2Qjs7OzsyQ0FHUixVQUFVO0FBQy9CLGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxNQUFNLEtBQUssTUFBTCxDQUFZLFNBQVMsSUFBVCxDQUFsQixFQUFrQyxNQUFNLEtBQUssTUFBTCxDQUFZLFNBQVMsSUFBVCxDQUFsQixFQUFoRSxDQUFQLENBRCtC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Q0FHbEIsVUFBVTtBQUNuQyxhQUFPLG9CQUFTLHNCQUFULEVBQWlDLEVBQUMsU0FBUyxLQUFLLE1BQUwsQ0FBWSxTQUFTLE9BQVQsQ0FBckIsRUFBd0MsWUFBWSxLQUFLLE1BQUwsQ0FBWSxTQUFTLFVBQVQsQ0FBeEIsRUFBMUUsQ0FBUCxDQURtQzs7Ozt5Q0FHaEIsVUFBVTtBQUM3QixhQUFPLFFBQVAsQ0FENkI7Ozs7bURBR0EsVUFBVTtBQUN2QyxhQUFPLFFBQVAsQ0FEdUM7Ozs7bURBR1YsVUFBVTtBQUN2QyxhQUFPLFFBQVAsQ0FEdUM7Ozs7b0RBR1QsVUFBVTtBQUN4QyxhQUFPLFFBQVAsQ0FEd0M7Ozs7K0NBR2YsVUFBVTtBQUNuQyxVQUFJLFlBQVksS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLElBQVQsQ0FBYyxPQUFkLEVBQXJCLENBQVosQ0FEK0I7QUFFbkMsVUFBSSxTQUFKLEVBQWU7QUFDYixlQUFPLG9CQUFTLHNCQUFULEVBQWlDLEVBQUMsTUFBTSxVQUFVLEVBQVYsRUFBeEMsQ0FBUCxDQURhO09BQWY7QUFHQSxhQUFPLFFBQVAsQ0FMbUM7Ozs7Z0RBT1QsVUFBVTtBQUNwQyxhQUFPLFFBQVAsQ0FEb0M7Ozs7a0RBR1IsVUFBVTtBQUN0QyxhQUFPLFFBQVAsQ0FEc0M7Ozs7a0RBR1YsVUFBVTtBQUN0QyxhQUFPLFFBQVAsQ0FEc0M7Ozs7U0F6VXJCIiwiZmlsZSI6InRlcm0tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge1Njb3BlLCBmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIgZnJvbSBcIi4vYXBwbHktc2NvcGUtaW4tcGFyYW1zLXJlZHVjZXJcIjtcbmltcG9ydCByZWR1Y2VyLCB7TW9ub2lkYWxSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IEV4cGFuZGVyIGZyb20gXCIuL2V4cGFuZGVyXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHtzZXJpYWxpemVyLCBtYWtlRGVzZXJpYWxpemVyfSBmcm9tIFwiLi9zZXJpYWxpemVyXCI7XG5pbXBvcnQge2VuZm9yZXN0RXhwciwgRW5mb3Jlc3Rlcn0gZnJvbSBcIi4vZW5mb3Jlc3RlclwiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtwcm9jZXNzVGVtcGxhdGV9IGZyb20gXCIuL3RlbXBsYXRlLXByb2Nlc3Nvci5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybUV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF83MjEpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzcyMTtcbiAgfVxuICBleHBhbmQodGVybV83MjIpIHtcbiAgICBsZXQgZmllbGRfNzIzID0gXCJleHBhbmRcIiArIHRlcm1fNzIyLnR5cGU7XG4gICAgaWYgKHR5cGVvZiB0aGlzW2ZpZWxkXzcyM10gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHRoaXNbZmllbGRfNzIzXSh0ZXJtXzcyMik7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJleHBhbmQgbm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgdGVybV83MjIudHlwZSk7XG4gIH1cbiAgZXhwYW5kVGVtcGxhdGVFeHByZXNzaW9uKHRlcm1fNzI0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fNzI0LnRhZyA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzI0LnRhZyksIGVsZW1lbnRzOiB0ZXJtXzcyNC5lbGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRCcmVha1N0YXRlbWVudCh0ZXJtXzcyNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV83MjUubGFiZWwgPyB0ZXJtXzcyNS5sYWJlbC52YWwoKSA6IG51bGx9KTtcbiAgfVxuICBleHBhbmREb1doaWxlU3RhdGVtZW50KHRlcm1fNzI2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRG9XaGlsZVN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83MjYuYm9keSksIHRlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzI2LnRlc3QpfSk7XG4gIH1cbiAgZXhwYW5kV2l0aFN0YXRlbWVudCh0ZXJtXzcyNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIldpdGhTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzI3LmJvZHkpLCBvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzI3Lm9iamVjdCl9KTtcbiAgfVxuICBleHBhbmREZWJ1Z2dlclN0YXRlbWVudCh0ZXJtXzcyOCkge1xuICAgIHJldHVybiB0ZXJtXzcyODtcbiAgfVxuICBleHBhbmRDb250aW51ZVN0YXRlbWVudCh0ZXJtXzcyOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV83MjkubGFiZWwgPyB0ZXJtXzcyOS5sYWJlbC52YWwoKSA6IG51bGx9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCh0ZXJtXzczMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm1fNzMwLmRpc2NyaW1pbmFudCksIHByZURlZmF1bHRDYXNlczogdGVybV83MzAucHJlRGVmYXVsdENhc2VzLm1hcChjXzczMSA9PiB0aGlzLmV4cGFuZChjXzczMSkpLnRvQXJyYXkoKSwgZGVmYXVsdENhc2U6IHRoaXMuZXhwYW5kKHRlcm1fNzMwLmRlZmF1bHRDYXNlKSwgcG9zdERlZmF1bHRDYXNlczogdGVybV83MzAucG9zdERlZmF1bHRDYXNlcy5tYXAoY183MzIgPT4gdGhpcy5leHBhbmQoY183MzIpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDb21wdXRlZE1lbWJlckV4cHJlc3Npb24odGVybV83MzMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV83MzMub2JqZWN0KSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83MzMuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnQodGVybV83MzQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV83MzQuZGlzY3JpbWluYW50KSwgY2FzZXM6IHRlcm1fNzM0LmNhc2VzLm1hcChjXzczNSA9PiB0aGlzLmV4cGFuZChjXzczNSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEZvcm1hbFBhcmFtZXRlcnModGVybV83MzYpIHtcbiAgICBsZXQgcmVzdF83MzcgPSB0ZXJtXzczNi5yZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83MzYucmVzdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHRlcm1fNzM2Lml0ZW1zLm1hcChpXzczOCA9PiB0aGlzLmV4cGFuZChpXzczOCkpLCByZXN0OiByZXN0XzczN30pO1xuICB9XG4gIGV4cGFuZEFycm93RXhwcmVzc2lvbih0ZXJtXzczOSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV83MzksIFwiQXJyb3dFeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZFN3aXRjaERlZmF1bHQodGVybV83NDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0ZXJtXzc0MC5jb25zZXF1ZW50Lm1hcChjXzc0MSA9PiB0aGlzLmV4cGFuZChjXzc0MSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaENhc2UodGVybV83NDIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0Mi50ZXN0KSwgY29uc2VxdWVudDogdGVybV83NDIuY29uc2VxdWVudC5tYXAoY183NDMgPT4gdGhpcy5leHBhbmQoY183NDMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JJblN0YXRlbWVudCh0ZXJtXzc0NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvckluU3RhdGVtZW50XCIsIHtsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtXzc0NC5sZWZ0KSwgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm1fNzQ0LnJpZ2h0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NDQuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUcnlDYXRjaFN0YXRlbWVudCh0ZXJtXzc0NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUNhdGNoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc0NS5ib2R5KSwgY2F0Y2hDbGF1c2U6IHRoaXMuZXhwYW5kKHRlcm1fNzQ1LmNhdGNoQ2xhdXNlKX0pO1xuICB9XG4gIGV4cGFuZFRyeUZpbmFsbHlTdGF0ZW1lbnQodGVybV83NDYpIHtcbiAgICBsZXQgY2F0Y2hDbGF1c2VfNzQ3ID0gdGVybV83NDYuY2F0Y2hDbGF1c2UgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc0Ni5jYXRjaENsYXVzZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV83NDYuYm9keSksIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZV83NDcsIGZpbmFsaXplcjogdGhpcy5leHBhbmQodGVybV83NDYuZmluYWxpemVyKX0pO1xuICB9XG4gIGV4cGFuZENhdGNoQ2xhdXNlKHRlcm1fNzQ4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2F0Y2hDbGF1c2VcIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNzQ4LmJpbmRpbmcpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzc0OC5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZFRocm93U3RhdGVtZW50KHRlcm1fNzQ5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fNzQ5LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kRm9yT2ZTdGF0ZW1lbnQodGVybV83NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JPZlN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV83NTAubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzc1MC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzUwLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ0lkZW50aWZpZXIodGVybV83NTEpIHtcbiAgICByZXR1cm4gdGVybV83NTE7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtXzc1Mikge1xuICAgIHJldHVybiB0ZXJtXzc1MjtcbiAgfVxuICBleHBhbmRCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSh0ZXJtXzc1Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzc1My5uYW1lKSwgYmluZGluZzogdGhpcy5leHBhbmQodGVybV83NTMuYmluZGluZyl9KTtcbiAgfVxuICBleHBhbmRDb21wdXRlZFByb3BlcnR5TmFtZSh0ZXJtXzc1NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc1NC5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZE9iamVjdEJpbmRpbmcodGVybV83NTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzc1NS5wcm9wZXJ0aWVzLm1hcCh0Xzc1NiA9PiB0aGlzLmV4cGFuZCh0Xzc1NikpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZEFycmF5QmluZGluZyh0ZXJtXzc1Nykge1xuICAgIGxldCByZXN0RWxlbWVudF83NTggPSB0ZXJtXzc1Ny5yZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzU3LnJlc3RFbGVtZW50KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzc1Ny5lbGVtZW50cy5tYXAodF83NTkgPT4gdF83NTkgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0Xzc1OSkpLnRvQXJyYXkoKSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50Xzc1OH0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdXaXRoRGVmYXVsdCh0ZXJtXzc2MCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV83NjAuYmluZGluZyksIGluaXQ6IHRoaXMuZXhwYW5kKHRlcm1fNzYwLmluaXQpfSk7XG4gIH1cbiAgZXhwYW5kU2hvcnRoYW5kUHJvcGVydHkodGVybV83NjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGVybV83NjEubmFtZX0pLCBleHByZXNzaW9uOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0ZXJtXzc2MS5uYW1lfSl9KTtcbiAgfVxuICBleHBhbmRGb3JTdGF0ZW1lbnQodGVybV83NjIpIHtcbiAgICBsZXQgaW5pdF83NjMgPSB0ZXJtXzc2Mi5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjIuaW5pdCk7XG4gICAgbGV0IHRlc3RfNzY0ID0gdGVybV83NjIudGVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzYyLnRlc3QpO1xuICAgIGxldCB1cGRhdGVfNzY1ID0gdGVybV83NjIudXBkYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV83NjIudXBkYXRlKTtcbiAgICBsZXQgYm9keV83NjYgPSB0aGlzLmV4cGFuZCh0ZXJtXzc2Mi5ib2R5KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IGluaXRfNzYzLCB0ZXN0OiB0ZXN0Xzc2NCwgdXBkYXRlOiB1cGRhdGVfNzY1LCBib2R5OiBib2R5Xzc2Nn0pO1xuICB9XG4gIGV4cGFuZFlpZWxkRXhwcmVzc2lvbih0ZXJtXzc2Nykge1xuICAgIGxldCBleHByXzc2OCA9IHRlcm1fNzY3LmV4cHJlc3Npb24gPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc2Ny5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IGV4cHJfNzY4fSk7XG4gIH1cbiAgZXhwYW5kWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uKHRlcm1fNzY5KSB7XG4gICAgbGV0IGV4cHJfNzcwID0gdGVybV83NjkuZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzY5LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl83NzB9KTtcbiAgfVxuICBleHBhbmRXaGlsZVN0YXRlbWVudCh0ZXJtXzc3MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIldoaWxlU3RhdGVtZW50XCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzc3MS50ZXN0KSwgYm9keTogdGhpcy5leHBhbmQodGVybV83NzEuYm9keSl9KTtcbiAgfVxuICBleHBhbmRJZlN0YXRlbWVudCh0ZXJtXzc3Mikge1xuICAgIGxldCBjb25zZXF1ZW50Xzc3MyA9IHRlcm1fNzcyLmNvbnNlcXVlbnQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc3Mi5jb25zZXF1ZW50KTtcbiAgICBsZXQgYWx0ZXJuYXRlXzc3NCA9IHRlcm1fNzcyLmFsdGVybmF0ZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzcyLmFsdGVybmF0ZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWZTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNzcyLnRlc3QpLCBjb25zZXF1ZW50OiBjb25zZXF1ZW50Xzc3MywgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfNzc0fSk7XG4gIH1cbiAgZXhwYW5kQmxvY2tTdGF0ZW1lbnQodGVybV83NzUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZXhwYW5kKHRlcm1fNzc1LmJsb2NrKX0pO1xuICB9XG4gIGV4cGFuZEJsb2NrKHRlcm1fNzc2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tcIiwge3N0YXRlbWVudHM6IHRlcm1fNzc2LnN0YXRlbWVudHMubWFwKHNfNzc3ID0+IHRoaXMuZXhwYW5kKHNfNzc3KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCh0ZXJtXzc3OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzc3OC5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRSZXR1cm5TdGF0ZW1lbnQodGVybV83NzkpIHtcbiAgICBpZiAodGVybV83NzkuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGVybV83Nzk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83NzkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRDbGFzc0RlY2xhcmF0aW9uKHRlcm1fNzgwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NEZWNsYXJhdGlvblwiLCB7bmFtZTogdGVybV83ODAubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzgwLm5hbWUpLCBzdXBlcjogdGVybV83ODAuc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4MC5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzc4MC5lbGVtZW50cy5tYXAoZWxfNzgxID0+IHRoaXMuZXhwYW5kKGVsXzc4MSkpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRXhwcmVzc2lvbih0ZXJtXzc4Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRXhwcmVzc2lvblwiLCB7bmFtZTogdGVybV83ODIubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNzgyLm5hbWUpLCBzdXBlcjogdGVybV83ODIuc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzc4Mi5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzc4Mi5lbGVtZW50cy5tYXAoZWxfNzgzID0+IHRoaXMuZXhwYW5kKGVsXzc4MykpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZENsYXNzRWxlbWVudCh0ZXJtXzc4NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNsYXNzRWxlbWVudFwiLCB7aXNTdGF0aWM6IHRlcm1fNzg0LmlzU3RhdGljLCBtZXRob2Q6IHRoaXMuZXhwYW5kKHRlcm1fNzg0Lm1ldGhvZCl9KTtcbiAgfVxuICBleHBhbmRUaGlzRXhwcmVzc2lvbih0ZXJtXzc4NSkge1xuICAgIHJldHVybiB0ZXJtXzc4NTtcbiAgfVxuICBleHBhbmRTeW50YXhUZW1wbGF0ZSh0ZXJtXzc4Nikge1xuICAgIGxldCBleHBhbmRlcl83ODcgPSBuZXcgRXhwYW5kZXIodGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcl83ODggPSBwcm9jZXNzVGVtcGxhdGUodGVybV83ODYudGVtcGxhdGUuaW5uZXIoKSk7XG4gICAgbGV0IHN0cl83ODkgPSBTeW50YXguZnJvbVN0cmluZyhzZXJpYWxpemVyLndyaXRlKHJfNzg4LnRlbXBsYXRlKSk7XG4gICAgbGV0IGNhbGxlZV83OTAgPSBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoXCJzeW50YXhUZW1wbGF0ZVwiKX0pO1xuICAgIGxldCBleHBhbmRlZEludGVycHNfNzkxID0gcl83ODguaW50ZXJwLm1hcChpXzc5MyA9PiB7XG4gICAgICBsZXQgZW5mXzc5NCA9IG5ldyBFbmZvcmVzdGVyKGlfNzkzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmQoZW5mXzc5NC5lbmZvcmVzdChcImV4cHJlc3Npb25cIikpO1xuICAgIH0pO1xuICAgIGxldCBhcmdzXzc5MiA9IExpc3Qub2YobmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHN0cl83ODl9KSkuY29uY2F0KGV4cGFuZGVkSW50ZXJwc183OTEpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV83OTAsIGFyZ3VtZW50czogYXJnc183OTJ9KTtcbiAgfVxuICBleHBhbmRTeW50YXhRdW90ZSh0ZXJtXzc5NSkge1xuICAgIGxldCBzdHJfNzk2ID0gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IFN5bnRheC5mcm9tU3RyaW5nKHNlcmlhbGl6ZXIud3JpdGUodGVybV83OTUubmFtZSkpfSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fNzk1LnRlbXBsYXRlLnRhZywgZWxlbWVudHM6IHRlcm1fNzk1LnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyXzc5NikucHVzaChuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IFwiXCJ9KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzc5Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV83OTcub2JqZWN0KSwgcHJvcGVydHk6IHRlcm1fNzk3LnByb3BlcnR5fSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlFeHByZXNzaW9uKHRlcm1fNzk4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogdGVybV83OTguZWxlbWVudHMubWFwKHRfNzk5ID0+IHRfNzk5ID09IG51bGwgPyB0Xzc5OSA6IHRoaXMuZXhwYW5kKHRfNzk5KSl9KTtcbiAgfVxuICBleHBhbmRJbXBvcnQodGVybV84MDApIHtcbiAgICByZXR1cm4gdGVybV84MDA7XG4gIH1cbiAgZXhwYW5kSW1wb3J0TmFtZXNwYWNlKHRlcm1fODAxKSB7XG4gICAgcmV0dXJuIHRlcm1fODAxO1xuICB9XG4gIGV4cGFuZEV4cG9ydCh0ZXJtXzgwMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZXhwYW5kKHRlcm1fODAyLmRlY2xhcmF0aW9uKX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydERlZmF1bHQodGVybV84MDMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzgwMy5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEV4cG9ydEZyb20odGVybV84MDQpIHtcbiAgICByZXR1cm4gdGVybV84MDQ7XG4gIH1cbiAgZXhwYW5kRXhwb3J0QWxsRnJvbSh0ZXJtXzgwNSkge1xuICAgIHJldHVybiB0ZXJtXzgwNTtcbiAgfVxuICBleHBhbmRFeHBvcnRTcGVjaWZpZXIodGVybV84MDYpIHtcbiAgICByZXR1cm4gdGVybV84MDY7XG4gIH1cbiAgZXhwYW5kU3RhdGljUHJvcGVydHlOYW1lKHRlcm1fODA3KSB7XG4gICAgcmV0dXJuIHRlcm1fODA3O1xuICB9XG4gIGV4cGFuZERhdGFQcm9wZXJ0eSh0ZXJtXzgwOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV84MDgubmFtZSksIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm1fODA4LmV4cHJlc3Npb24pfSk7XG4gIH1cbiAgZXhwYW5kT2JqZWN0RXhwcmVzc2lvbih0ZXJtXzgwOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHRlcm1fODA5LnByb3BlcnRpZXMubWFwKHRfODEwID0+IHRoaXMuZXhwYW5kKHRfODEwKSl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybV84MTEpIHtcbiAgICBsZXQgaW5pdF84MTIgPSB0ZXJtXzgxMS5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV84MTEuaW5pdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzgxMS5iaW5kaW5nKSwgaW5pdDogaW5pdF84MTJ9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fODEzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDogdGVybV84MTMua2luZCwgZGVjbGFyYXRvcnM6IHRlcm1fODEzLmRlY2xhcmF0b3JzLm1hcChkXzgxNCA9PiB0aGlzLmV4cGFuZChkXzgxNCkpfSk7XG4gIH1cbiAgZXhwYW5kUGFyZW50aGVzaXplZEV4cHJlc3Npb24odGVybV84MTUpIHtcbiAgICBpZiAodGVybV84MTUuaW5uZXIuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBlbmQgb2YgaW5wdXRcIik7XG4gICAgfVxuICAgIGxldCBlbmZfODE2ID0gbmV3IEVuZm9yZXN0ZXIodGVybV84MTUuaW5uZXIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzgxNyA9IGVuZl84MTYucGVlaygpO1xuICAgIGxldCB0XzgxOCA9IGVuZl84MTYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRfODE4ID09IG51bGwgfHwgZW5mXzgxNi5yZXN0LnNpemUgPiAwKSB7XG4gICAgICB0aHJvdyBlbmZfODE2LmNyZWF0ZUVycm9yKGxvb2thaGVhZF84MTcsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4cGFuZCh0XzgxOCk7XG4gIH1cbiAgZXhwYW5kVW5hcnlFeHByZXNzaW9uKHRlcm1fODE5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVW5hcnlFeHByZXNzaW9uXCIsIHtvcGVyYXRvcjogdGVybV84MTkub3BlcmF0b3IsIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm1fODE5Lm9wZXJhbmQpfSk7XG4gIH1cbiAgZXhwYW5kVXBkYXRlRXhwcmVzc2lvbih0ZXJtXzgyMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiB0ZXJtXzgyMC5pc1ByZWZpeCwgb3BlcmF0b3I6IHRlcm1fODIwLm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzgyMC5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZEJpbmFyeUV4cHJlc3Npb24odGVybV84MjEpIHtcbiAgICBsZXQgbGVmdF84MjIgPSB0aGlzLmV4cGFuZCh0ZXJtXzgyMS5sZWZ0KTtcbiAgICBsZXQgcmlnaHRfODIzID0gdGhpcy5leHBhbmQodGVybV84MjEucmlnaHQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfODIyLCBvcGVyYXRvcjogdGVybV84MjEub3BlcmF0b3IsIHJpZ2h0OiByaWdodF84MjN9KTtcbiAgfVxuICBleHBhbmRDb25kaXRpb25hbEV4cHJlc3Npb24odGVybV84MjQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fODI0LnRlc3QpLCBjb25zZXF1ZW50OiB0aGlzLmV4cGFuZCh0ZXJtXzgyNC5jb25zZXF1ZW50KSwgYWx0ZXJuYXRlOiB0aGlzLmV4cGFuZCh0ZXJtXzgyNC5hbHRlcm5hdGUpfSk7XG4gIH1cbiAgZXhwYW5kTmV3VGFyZ2V0RXhwcmVzc2lvbih0ZXJtXzgyNSkge1xuICAgIHJldHVybiB0ZXJtXzgyNTtcbiAgfVxuICBleHBhbmROZXdFeHByZXNzaW9uKHRlcm1fODI2KSB7XG4gICAgbGV0IGNhbGxlZV84MjcgPSB0aGlzLmV4cGFuZCh0ZXJtXzgyNi5jYWxsZWUpO1xuICAgIGxldCBlbmZfODI4ID0gbmV3IEVuZm9yZXN0ZXIodGVybV84MjYuYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3NfODI5ID0gZW5mXzgyOC5lbmZvcmVzdEFyZ3VtZW50TGlzdCgpLm1hcChhcmdfODMwID0+IHRoaXMuZXhwYW5kKGFyZ184MzApKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV84MjcsIGFyZ3VtZW50czogYXJnc184MjkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3VwZXIodGVybV84MzEpIHtcbiAgICByZXR1cm4gdGVybV84MzE7XG4gIH1cbiAgZXhwYW5kQ2FsbEV4cHJlc3Npb24odGVybV84MzIpIHtcbiAgICBsZXQgY2FsbGVlXzgzMyA9IHRoaXMuZXhwYW5kKHRlcm1fODMyLmNhbGxlZSk7XG4gICAgbGV0IGVuZl84MzQgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtXzgzMi5hcmd1bWVudHMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYXJnc184MzUgPSBlbmZfODM0LmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZ184MzYgPT4gdGhpcy5leHBhbmQoYXJnXzgzNikpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV84MzMsIGFyZ3VtZW50czogYXJnc184MzV9KTtcbiAgfVxuICBleHBhbmRTcHJlYWRFbGVtZW50KHRlcm1fODM3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV84MzcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFeHByZXNzaW9uU3RhdGVtZW50KHRlcm1fODM4KSB7XG4gICAgbGV0IGNoaWxkXzgzOSA9IHRoaXMuZXhwYW5kKHRlcm1fODM4LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGNoaWxkXzgzOX0pO1xuICB9XG4gIGV4cGFuZExhYmVsZWRTdGF0ZW1lbnQodGVybV84NDApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV84NDAubGFiZWwudmFsKCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fODQwLmJvZHkpfSk7XG4gIH1cbiAgZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg0MSwgdHlwZV84NDIpIHtcbiAgICBsZXQgc2NvcGVfODQzID0gZnJlc2hTY29wZShcImZ1blwiKTtcbiAgICBsZXQgcmVkXzg0NCA9IG5ldyBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyKHNjb3BlXzg0MywgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcGFyYW1zXzg0NTtcbiAgICBpZiAodHlwZV84NDIgIT09IFwiR2V0dGVyXCIgJiYgdHlwZV84NDIgIT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHBhcmFtc184NDUgPSByZWRfODQ0LnRyYW5zZm9ybSh0ZXJtXzg0MS5wYXJhbXMpO1xuICAgICAgcGFyYW1zXzg0NSA9IHRoaXMuZXhwYW5kKHBhcmFtc184NDUpO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfODQzKTtcbiAgICBsZXQgZXhwYW5kZXJfODQ2ID0gbmV3IEV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfODQ3LCBib2R5VGVybV84NDg7XG4gICAgaWYgKHRlcm1fODQxLmJvZHkgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICBib2R5VGVybV84NDggPSB0aGlzLmV4cGFuZCh0ZXJtXzg0MS5ib2R5LmFkZFNjb3BlKHNjb3BlXzg0MywgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlZEJvZHlfODQ3ID0gdGVybV84NDEuYm9keS5tYXAoYl84NDkgPT4gYl84NDkuYWRkU2NvcGUoc2NvcGVfODQzLCB0aGlzLmNvbnRleHQuYmluZGluZ3MpKTtcbiAgICAgIGJvZHlUZXJtXzg0OCA9IG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtkaXJlY3RpdmVzOiBMaXN0KCksIHN0YXRlbWVudHM6IGV4cGFuZGVyXzg0Ni5leHBhbmQobWFya2VkQm9keV84NDcpfSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucG9wKCk7XG4gICAgaWYgKHR5cGVfODQyID09PSBcIkdldHRlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NDIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzg0MS5uYW1lKSwgYm9keTogYm9keVRlcm1fODQ4fSk7XG4gICAgfSBlbHNlIGlmICh0eXBlXzg0MiA9PT0gXCJTZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODQyLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV84NDEubmFtZSksIHBhcmFtOiB0ZXJtXzg0MS5wYXJhbSwgYm9keTogYm9keVRlcm1fODQ4fSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg0Miwge25hbWU6IHRlcm1fODQxLm5hbWUsIGlzR2VuZXJhdG9yOiB0ZXJtXzg0MS5pc0dlbmVyYXRvciwgcGFyYW1zOiBwYXJhbXNfODQ1LCBib2R5OiBib2R5VGVybV84NDh9KTtcbiAgfVxuICBleHBhbmRNZXRob2QodGVybV84NTApIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODUwLCBcIk1ldGhvZFwiKTtcbiAgfVxuICBleHBhbmRTZXR0ZXIodGVybV84NTEpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODUxLCBcIlNldHRlclwiKTtcbiAgfVxuICBleHBhbmRHZXR0ZXIodGVybV84NTIpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fODUyLCBcIkdldHRlclwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkRlY2xhcmF0aW9uKHRlcm1fODUzKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzg1MywgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIpO1xuICB9XG4gIGV4cGFuZEZ1bmN0aW9uRXhwcmVzc2lvbih0ZXJtXzg1NCkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV84NTQsIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpO1xuICB9XG4gIGV4cGFuZENvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24odGVybV84NTUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzg1NS5iaW5kaW5nKSwgb3BlcmF0b3I6IHRlcm1fODU1Lm9wZXJhdG9yLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzg1NS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fODU2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fODU2LmJpbmRpbmcpLCBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzg1Ni5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEVtcHR5U3RhdGVtZW50KHRlcm1fODU3KSB7XG4gICAgcmV0dXJuIHRlcm1fODU3O1xuICB9XG4gIGV4cGFuZExpdGVyYWxCb29sZWFuRXhwcmVzc2lvbih0ZXJtXzg1OCkge1xuICAgIHJldHVybiB0ZXJtXzg1ODtcbiAgfVxuICBleHBhbmRMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24odGVybV84NTkpIHtcbiAgICByZXR1cm4gdGVybV84NTk7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbih0ZXJtXzg2MCkge1xuICAgIHJldHVybiB0ZXJtXzg2MDtcbiAgfVxuICBleHBhbmRJZGVudGlmaWVyRXhwcmVzc2lvbih0ZXJtXzg2MSkge1xuICAgIGxldCB0cmFuc184NjIgPSB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzg2MS5uYW1lLnJlc29sdmUoKSk7XG4gICAgaWYgKHRyYW5zXzg2Mikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRyYW5zXzg2Mi5pZH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVybV84NjE7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bGxFeHByZXNzaW9uKHRlcm1fODYzKSB7XG4gICAgcmV0dXJuIHRlcm1fODYzO1xuICB9XG4gIGV4cGFuZExpdGVyYWxTdHJpbmdFeHByZXNzaW9uKHRlcm1fODY0KSB7XG4gICAgcmV0dXJuIHRlcm1fODY0O1xuICB9XG4gIGV4cGFuZExpdGVyYWxSZWdFeHBFeHByZXNzaW9uKHRlcm1fODY1KSB7XG4gICAgcmV0dXJuIHRlcm1fODY1O1xuICB9XG59XG4iXX0=