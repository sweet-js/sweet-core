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
  function TermExpander(context_603) {
    _classCallCheck(this, TermExpander);

    this.context = context_603;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term_604) {
      var field_605 = "expand" + term_604.type;
      if (typeof this[field_605] === "function") {
        return this[field_605](term_604);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term_604.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term_606) {
      return new _terms2.default("TemplateExpression", { tag: term_606.tag == null ? null : this.expand(term_606.tag), elements: term_606.elements.toArray() });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term_607) {
      return new _terms2.default("BreakStatement", { label: term_607.label ? term_607.label.val() : null });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term_608) {
      return new _terms2.default("DoWhileStatement", { body: this.expand(term_608.body), test: this.expand(term_608.test) });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term_609) {
      return new _terms2.default("WithStatement", { body: this.expand(term_609.body), object: this.expand(term_609.object) });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term_610) {
      return term_610;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term_611) {
      return new _terms2.default("ContinueStatement", { label: term_611.label ? term_611.label.val() : null });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term_612) {
      var _this = this;

      return new _terms2.default("SwitchStatementWithDefault", { discriminant: this.expand(term_612.discriminant), preDefaultCases: term_612.preDefaultCases.map(function (c) {
          return _this.expand(c);
        }).toArray(), defaultCase: this.expand(term_612.defaultCase), postDefaultCases: term_612.postDefaultCases.map(function (c) {
          return _this.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term_613) {
      return new _terms2.default("ComputedMemberExpression", { object: this.expand(term_613.object), expression: this.expand(term_613.expression) });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term_614) {
      var _this2 = this;

      return new _terms2.default("SwitchStatement", { discriminant: this.expand(term_614.discriminant), cases: term_614.cases.map(function (c) {
          return _this2.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term_615) {
      var _this3 = this;

      var rest_616 = term_615.rest == null ? null : this.expand(term_615.rest);
      return new _terms2.default("FormalParameters", { items: term_615.items.map(function (i) {
          return _this3.expand(i);
        }), rest: rest_616 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_617) {
      return this.doFunctionExpansion(term_617, "ArrowExpression");
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_618) {
      var _this4 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_618.consequent.map(function (c) {
          return _this4.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_619) {
      var _this5 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_619.test), consequent: term_619.consequent.map(function (c) {
          return _this5.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_620) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_620.left), right: this.expand(term_620.right), body: this.expand(term_620.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_621) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_621.body), catchClause: this.expand(term_621.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_622) {
      var catchClause_623 = term_622.catchClause == null ? null : this.expand(term_622.catchClause);
      return new _terms2.default("TryFinallyStatement", { body: this.expand(term_622.body), catchClause: catchClause_623, finalizer: this.expand(term_622.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_624) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_624.binding), body: this.expand(term_624.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_625) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_625.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_626) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_626.left), right: this.expand(term_626.right), body: this.expand(term_626.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_627) {
      return term_627;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_628) {
      return term_628;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_629) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_629.name), binding: this.expand(term_629.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_630) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_630.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_631) {
      var _this6 = this;

      return new _terms2.default("ObjectBinding", { properties: term_631.properties.map(function (t) {
          return _this6.expand(t);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_632) {
      var _this7 = this;

      var restElement_633 = term_632.restElement == null ? null : this.expand(term_632.restElement);
      return new _terms2.default("ArrayBinding", { elements: term_632.elements.map(function (t) {
          return t == null ? null : _this7.expand(t);
        }).toArray(), restElement: restElement_633 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_634) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_634.binding), init: this.expand(term_634.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_635) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_635.name }), expression: new _terms2.default("IdentifierExpression", { name: term_635.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_636) {
      var init_637 = term_636.init == null ? null : this.expand(term_636.init);
      var test_638 = term_636.test == null ? null : this.expand(term_636.test);
      var update_639 = term_636.update == null ? null : this.expand(term_636.update);
      var body_640 = this.expand(term_636.body);
      return new _terms2.default("ForStatement", { init: init_637, test: test_638, update: update_639, body: body_640 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_641) {
      var expr_642 = term_641.expression == null ? null : this.expand(term_641.expression);
      return new _terms2.default("YieldExpression", { expression: expr_642 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_643) {
      var expr_644 = term_643.expression == null ? null : this.expand(term_643.expression);
      return new _terms2.default("YieldGeneratorExpression", { expression: expr_644 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_645) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_645.test), body: this.expand(term_645.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_646) {
      var consequent_647 = term_646.consequent == null ? null : this.expand(term_646.consequent);
      var alternate_648 = term_646.alternate == null ? null : this.expand(term_646.alternate);
      return new _terms2.default("IfStatement", { test: this.expand(term_646.test), consequent: consequent_647, alternate: alternate_648 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_649) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_649.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_650) {
      var _this8 = this;

      return new _terms2.default("Block", { statements: term_650.statements.map(function (s) {
          return _this8.expand(s);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_651) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_651.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_652) {
      if (term_652.expression == null) {
        return term_652;
      }
      return new _terms2.default("ReturnStatement", { expression: this.expand(term_652.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_653) {
      var _this9 = this;

      return new _terms2.default("ClassDeclaration", { name: term_653.name == null ? null : this.expand(term_653.name), super: term_653.super == null ? null : this.expand(term_653.super), elements: term_653.elements.map(function (el) {
          return _this9.expand(el);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_654) {
      var _this10 = this;

      return new _terms2.default("ClassExpression", { name: term_654.name == null ? null : this.expand(term_654.name), super: term_654.super == null ? null : this.expand(term_654.super), elements: term_654.elements.map(function (el) {
          return _this10.expand(el);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_655) {
      return new _terms2.default("ClassElement", { isStatic: term_655.isStatic, method: this.expand(term_655.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_656) {
      return term_656;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_657) {
      var _this11 = this;

      var expander_658 = new _expander2.default(this.context);
      var r_659 = (0, _templateProcessor.processTemplate)(term_657.template.inner());
      var str_660 = _syntax2.default.fromString(_serializer.serializer.write(r_659.template));
      var callee_661 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });
      var expandedInterps_662 = r_659.interp.map(function (i) {
        var enf_664 = new _enforester.Enforester(i, (0, _immutable.List)(), _this11.context);
        return _this11.expand(enf_664.enforest("expression"));
      });
      var args_663 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_660 })).concat(expandedInterps_662);
      return new _terms2.default("CallExpression", { callee: callee_661, arguments: args_663 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_665) {
      var str_666 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_665.name)) });
      return new _terms2.default("TemplateExpression", { tag: term_665.template.tag, elements: term_665.template.elements.push(str_666).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_667) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_667.object), property: term_667.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_668) {
      var _this12 = this;

      return new _terms2.default("ArrayExpression", { elements: term_668.elements.map(function (t) {
          return t == null ? t : _this12.expand(t);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_669) {
      return term_669;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_670) {
      return term_670;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_671) {
      return new _terms2.default("Export", { declaration: this.expand(term_671.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_672) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_672.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_673) {
      return term_673;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_674) {
      return term_674;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_675) {
      return term_675;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_676) {
      return term_676;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_677) {
      return new _terms2.default("DataProperty", { name: this.expand(term_677.name), expression: this.expand(term_677.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_678) {
      var _this13 = this;

      return new _terms2.default("ObjectExpression", { properties: term_678.properties.map(function (t) {
          return _this13.expand(t);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_679) {
      var init_680 = term_679.init == null ? null : this.expand(term_679.init);
      return new _terms2.default("VariableDeclarator", { binding: this.expand(term_679.binding), init: init_680 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_681) {
      var _this14 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_681.kind, declarators: term_681.declarators.map(function (d) {
          return _this14.expand(d);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_682) {
      if (term_682.inner.size === 0) {
        throw new Error("unexpected end of input");
      }
      var enf_683 = new _enforester.Enforester(term_682.inner, (0, _immutable.List)(), this.context);
      var lookahead_684 = enf_683.peek();
      var t_685 = enf_683.enforestExpression();
      if (t_685 == null || enf_683.rest.size > 0) {
        throw enf_683.createError(lookahead_684, "unexpected syntax");
      }
      return this.expand(t_685);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_686) {
      return new _terms2.default("UnaryExpression", { operator: term_686.operator, operand: this.expand(term_686.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_687) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_687.isPrefix, operator: term_687.operator, operand: this.expand(term_687.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_688) {
      var left_689 = this.expand(term_688.left);
      var right_690 = this.expand(term_688.right);
      return new _terms2.default("BinaryExpression", { left: left_689, operator: term_688.operator, right: right_690 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_691) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_691.test), consequent: this.expand(term_691.consequent), alternate: this.expand(term_691.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_692) {
      return term_692;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_693) {
      var _this15 = this;

      var callee_694 = this.expand(term_693.callee);
      var enf_695 = new _enforester.Enforester(term_693.arguments, (0, _immutable.List)(), this.context);
      var args_696 = enf_695.enforestArgumentList().map(function (arg) {
        return _this15.expand(arg);
      });
      return new _terms2.default("NewExpression", { callee: callee_694, arguments: args_696.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_697) {
      return term_697;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_698) {
      var _this16 = this;

      var callee_699 = this.expand(term_698.callee);
      var enf_700 = new _enforester.Enforester(term_698.arguments, (0, _immutable.List)(), this.context);
      var args_701 = enf_700.enforestArgumentList().map(function (arg) {
        return _this16.expand(arg);
      });
      return new _terms2.default("CallExpression", { callee: callee_699, arguments: args_701 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_702) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_702.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_703) {
      var child_704 = this.expand(term_703.expression);
      return new _terms2.default("ExpressionStatement", { expression: child_704 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_705) {
      return new _terms2.default("LabeledStatement", { label: term_705.label.val(), body: this.expand(term_705.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_706, type_707) {
      var _this17 = this;

      var scope_708 = (0, _scope.freshScope)("fun");
      var red_709 = new _applyScopeInParamsReducer2.default(scope_708, this.context);
      var params_710 = void 0;
      if (type_707 !== "Getter" && type_707 !== "Setter") {
        params_710 = red_709.transform(term_706.params);
        params_710 = this.expand(params_710);
      }
      this.context.currentScope.push(scope_708);
      var expander_711 = new _expander2.default(this.context);
      var markedBody_712 = void 0,
          bodyTerm_713 = void 0;
      if (term_706.body instanceof _terms2.default) {
        bodyTerm_713 = this.expand(term_706.body.addScope(scope_708, this.context.bindings));
      } else {
        markedBody_712 = term_706.body.map(function (b) {
          return b.addScope(scope_708, _this17.context.bindings);
        });
        bodyTerm_713 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_711.expand(markedBody_712) });
      }
      this.context.currentScope.pop();
      if (type_707 === "Getter") {
        return new _terms2.default(type_707, { name: this.expand(term_706.name), body: bodyTerm_713 });
      } else if (type_707 === "Setter") {
        return new _terms2.default(type_707, { name: this.expand(term_706.name), param: term_706.param, body: bodyTerm_713 });
      }
      return new _terms2.default(type_707, { name: term_706.name, isGenerator: term_706.isGenerator, params: params_710, body: bodyTerm_713 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_714) {
      return this.doFunctionExpansion(term_714, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_715) {
      return this.doFunctionExpansion(term_715, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_716) {
      return this.doFunctionExpansion(term_716, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_717) {
      return this.doFunctionExpansion(term_717, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_718) {
      return this.doFunctionExpansion(term_718, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_719) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_719.binding), operator: term_719.operator, expression: this.expand(term_719.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_720) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_720.binding), expression: this.expand(term_720.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_721) {
      return term_721;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_722) {
      return term_722;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_723) {
      return term_723;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_724) {
      return term_724;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_725) {
      var trans_726 = this.context.env.get(term_725.name.resolve());
      if (trans_726) {
        return new _terms2.default("IdentifierExpression", { name: trans_726.id });
      }
      return term_725;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_727) {
      return term_727;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_728) {
      return term_728;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_729) {
      return term_729;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rlcm0tZXhwYW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztJQUNxQjtBQUNuQixXQURtQixZQUNuQixDQUFZLFdBQVosRUFBeUI7MEJBRE4sY0FDTTs7QUFDdkIsU0FBSyxPQUFMLEdBQWUsV0FBZixDQUR1QjtHQUF6Qjs7ZUFEbUI7OzJCQUlaLFVBQVU7QUFDZixVQUFJLFlBQVksV0FBVyxTQUFTLElBQVQsQ0FEWjtBQUVmLFVBQUksT0FBTyxLQUFLLFNBQUwsQ0FBUCxLQUEyQixVQUEzQixFQUF1QztBQUN6QyxlQUFPLEtBQUssU0FBTCxFQUFnQixRQUFoQixDQUFQLENBRHlDO09BQTNDO0FBR0EsMEJBQU8sS0FBUCxFQUFjLHFDQUFxQyxTQUFTLElBQVQsQ0FBbkQsQ0FMZTs7Ozs2Q0FPUSxVQUFVO0FBQ2pDLGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLFNBQVMsR0FBVCxJQUFnQixJQUFoQixHQUF1QixJQUF2QixHQUE4QixLQUFLLE1BQUwsQ0FBWSxTQUFTLEdBQVQsQ0FBMUMsRUFBeUQsVUFBVSxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBVixFQUE5RixDQUFQLENBRGlDOzs7O3lDQUdkLFVBQVU7QUFDN0IsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLE9BQU8sU0FBUyxLQUFULEdBQWlCLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBakIsR0FBd0MsSUFBeEMsRUFBbkMsQ0FBUCxDQUQ2Qjs7OzsyQ0FHUixVQUFVO0FBQy9CLGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxNQUFNLEtBQUssTUFBTCxDQUFZLFNBQVMsSUFBVCxDQUFsQixFQUFrQyxNQUFNLEtBQUssTUFBTCxDQUFZLFNBQVMsSUFBVCxDQUFsQixFQUFoRSxDQUFQLENBRCtC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LFVBQVU7QUFDbkMsYUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLFNBQVMsS0FBSyxNQUFMLENBQVksU0FBUyxPQUFULENBQXJCLEVBQXdDLFlBQVksS0FBSyxNQUFMLENBQVksU0FBUyxVQUFULENBQXhCLEVBQTFFLENBQVAsQ0FEbUM7Ozs7eUNBR2hCLFVBQVU7QUFDN0IsYUFBTyxRQUFQLENBRDZCOzs7O21EQUdBLFVBQVU7QUFDdkMsYUFBTyxRQUFQLENBRHVDOzs7O21EQUdWLFVBQVU7QUFDdkMsYUFBTyxRQUFQLENBRHVDOzs7O29EQUdULFVBQVU7QUFDeEMsYUFBTyxRQUFQLENBRHdDOzs7OytDQUdmLFVBQVU7QUFDbkMsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxJQUFULENBQWMsT0FBZCxFQUFyQixDQUFaLENBRCtCO0FBRW5DLFVBQUksU0FBSixFQUFlO0FBQ2IsZUFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLE1BQU0sVUFBVSxFQUFWLEVBQXhDLENBQVAsQ0FEYTtPQUFmO0FBR0EsYUFBTyxRQUFQLENBTG1DOzs7O2dEQU9ULFVBQVU7QUFDcEMsYUFBTyxRQUFQLENBRG9DOzs7O2tEQUdSLFVBQVU7QUFDdEMsYUFBTyxRQUFQLENBRHNDOzs7O2tEQUdWLFVBQVU7QUFDdEMsYUFBTyxRQUFQLENBRHNDOzs7O1NBelVyQiIsImZpbGUiOiJ0ZXJtLWV4cGFuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyIGZyb20gXCIuL2FwcGx5LXNjb3BlLWluLXBhcmFtcy1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciwge01vbm9pZGFsUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCBFeHBhbmRlciBmcm9tIFwiLi9leHBhbmRlclwiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7c2VyaWFsaXplciwgbWFrZURlc2VyaWFsaXplcn0gZnJvbSBcIi4vc2VyaWFsaXplclwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7cHJvY2Vzc1RlbXBsYXRlfSBmcm9tIFwiLi90ZW1wbGF0ZS1wcm9jZXNzb3IuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1FeHBhbmRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfNjAzKSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF82MDM7XG4gIH1cbiAgZXhwYW5kKHRlcm1fNjA0KSB7XG4gICAgbGV0IGZpZWxkXzYwNSA9IFwiZXhwYW5kXCIgKyB0ZXJtXzYwNC50eXBlO1xuICAgIGlmICh0eXBlb2YgdGhpc1tmaWVsZF82MDVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpZWxkXzYwNV0odGVybV82MDQpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwiZXhwYW5kIG5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIHRlcm1fNjA0LnR5cGUpO1xuICB9XG4gIGV4cGFuZFRlbXBsYXRlRXhwcmVzc2lvbih0ZXJtXzYwNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0ZXJtXzYwNi50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzYwNi50YWcpLCBlbGVtZW50czogdGVybV82MDYuZWxlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQnJlYWtTdGF0ZW1lbnQodGVybV82MDcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNjA3LmxhYmVsID8gdGVybV82MDcubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtXzYwOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNjA4LmJvZHkpLCB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzYwOC50ZXN0KX0pO1xuICB9XG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybV82MDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzYwOS5ib2R5KSwgb2JqZWN0OiB0aGlzLmV4cGFuZCh0ZXJtXzYwOS5vYmplY3QpfSk7XG4gIH1cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybV82MTApIHtcbiAgICByZXR1cm4gdGVybV82MTA7XG4gIH1cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybV82MTEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IHRlcm1fNjExLmxhYmVsID8gdGVybV82MTEubGFiZWwudmFsKCkgOiBudWxsfSk7XG4gIH1cbiAgZXhwYW5kU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHQodGVybV82MTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiB0aGlzLmV4cGFuZCh0ZXJtXzYxMi5kaXNjcmltaW5hbnQpLCBwcmVEZWZhdWx0Q2FzZXM6IHRlcm1fNjEyLnByZURlZmF1bHRDYXNlcy5tYXAoYyA9PiB0aGlzLmV4cGFuZChjKSkudG9BcnJheSgpLCBkZWZhdWx0Q2FzZTogdGhpcy5leHBhbmQodGVybV82MTIuZGVmYXVsdENhc2UpLCBwb3N0RGVmYXVsdENhc2VzOiB0ZXJtXzYxMi5wb3N0RGVmYXVsdENhc2VzLm1hcChjID0+IHRoaXMuZXhwYW5kKGMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDb21wdXRlZE1lbWJlckV4cHJlc3Npb24odGVybV82MTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV82MTMub2JqZWN0KSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV82MTMuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnQodGVybV82MTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybV82MTQuZGlzY3JpbWluYW50KSwgY2FzZXM6IHRlcm1fNjE0LmNhc2VzLm1hcChjID0+IHRoaXMuZXhwYW5kKGMpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRGb3JtYWxQYXJhbWV0ZXJzKHRlcm1fNjE1KSB7XG4gICAgbGV0IHJlc3RfNjE2ID0gdGVybV82MTUucmVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNjE1LnJlc3QpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiB0ZXJtXzYxNS5pdGVtcy5tYXAoaSA9PiB0aGlzLmV4cGFuZChpKSksIHJlc3Q6IHJlc3RfNjE2fSk7XG4gIH1cbiAgZXhwYW5kQXJyb3dFeHByZXNzaW9uKHRlcm1fNjE3KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzYxNywgXCJBcnJvd0V4cHJlc3Npb25cIik7XG4gIH1cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtXzYxOCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRlcm1fNjE4LmNvbnNlcXVlbnQubWFwKGMgPT4gdGhpcy5leHBhbmQoYykpLnRvQXJyYXkoKX0pO1xuICB9XG4gIGV4cGFuZFN3aXRjaENhc2UodGVybV82MTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzYxOS50ZXN0KSwgY29uc2VxdWVudDogdGVybV82MTkuY29uc2VxdWVudC5tYXAoYyA9PiB0aGlzLmV4cGFuZChjKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybV82MjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JJblN0YXRlbWVudFwiLCB7bGVmdDogdGhpcy5leHBhbmQodGVybV82MjAubGVmdCksIHJpZ2h0OiB0aGlzLmV4cGFuZCh0ZXJtXzYyMC5yaWdodCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNjIwLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybV82MjEpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogdGhpcy5leHBhbmQodGVybV82MjEuYm9keSksIGNhdGNoQ2xhdXNlOiB0aGlzLmV4cGFuZCh0ZXJtXzYyMS5jYXRjaENsYXVzZSl9KTtcbiAgfVxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm1fNjIyKSB7XG4gICAgbGV0IGNhdGNoQ2xhdXNlXzYyMyA9IHRlcm1fNjIyLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82MjIuY2F0Y2hDbGF1c2UpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNjIyLmJvZHkpLCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2VfNjIzLCBmaW5hbGl6ZXI6IHRoaXMuZXhwYW5kKHRlcm1fNjIyLmZpbmFsaXplcil9KTtcbiAgfVxuICBleHBhbmRDYXRjaENsYXVzZSh0ZXJtXzYyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzYyNC5iaW5kaW5nKSwgYm9keTogdGhpcy5leHBhbmQodGVybV82MjQuYm9keSl9KTtcbiAgfVxuICBleHBhbmRUaHJvd1N0YXRlbWVudCh0ZXJtXzYyNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzYyNS5leHByZXNzaW9uKX0pO1xuICB9XG4gIGV4cGFuZEZvck9mU3RhdGVtZW50KHRlcm1fNjI2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yT2ZTdGF0ZW1lbnRcIiwge2xlZnQ6IHRoaXMuZXhwYW5kKHRlcm1fNjI2LmxlZnQpLCByaWdodDogdGhpcy5leHBhbmQodGVybV82MjYucmlnaHQpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzYyNi5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZEJpbmRpbmdJZGVudGlmaWVyKHRlcm1fNjI3KSB7XG4gICAgcmV0dXJuIHRlcm1fNjI3O1xuICB9XG4gIGV4cGFuZEJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIodGVybV82MjgpIHtcbiAgICByZXR1cm4gdGVybV82Mjg7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybV82MjkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGhpcy5leHBhbmQodGVybV82MjkubmFtZSksIGJpbmRpbmc6IHRoaXMuZXhwYW5kKHRlcm1fNjI5LmJpbmRpbmcpfSk7XG4gIH1cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybV82MzApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV82MzAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm1fNjMxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV82MzEucHJvcGVydGllcy5tYXAodCA9PiB0aGlzLmV4cGFuZCh0KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm1fNjMyKSB7XG4gICAgbGV0IHJlc3RFbGVtZW50XzYzMyA9IHRlcm1fNjMyLnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82MzIucmVzdEVsZW1lbnQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fNjMyLmVsZW1lbnRzLm1hcCh0ID0+IHQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0KSkudG9BcnJheSgpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfNjMzfSk7XG4gIH1cbiAgZXhwYW5kQmluZGluZ1dpdGhEZWZhdWx0KHRlcm1fNjM0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzYzNC5iaW5kaW5nKSwgaW5pdDogdGhpcy5leHBhbmQodGVybV82MzQuaW5pdCl9KTtcbiAgfVxuICBleHBhbmRTaG9ydGhhbmRQcm9wZXJ0eSh0ZXJtXzYzNSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0ZXJtXzYzNS5uYW1lfSksIGV4cHJlc3Npb246IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNjM1Lm5hbWV9KX0pO1xuICB9XG4gIGV4cGFuZEZvclN0YXRlbWVudCh0ZXJtXzYzNikge1xuICAgIGxldCBpbml0XzYzNyA9IHRlcm1fNjM2LmluaXQgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzYzNi5pbml0KTtcbiAgICBsZXQgdGVzdF82MzggPSB0ZXJtXzYzNi50ZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82MzYudGVzdCk7XG4gICAgbGV0IHVwZGF0ZV82MzkgPSB0ZXJtXzYzNi51cGRhdGUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzYzNi51cGRhdGUpO1xuICAgIGxldCBib2R5XzY0MCA9IHRoaXMuZXhwYW5kKHRlcm1fNjM2LmJvZHkpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF82MzcsIHRlc3Q6IHRlc3RfNjM4LCB1cGRhdGU6IHVwZGF0ZV82MzksIGJvZHk6IGJvZHlfNjQwfSk7XG4gIH1cbiAgZXhwYW5kWWllbGRFeHByZXNzaW9uKHRlcm1fNjQxKSB7XG4gICAgbGV0IGV4cHJfNjQyID0gdGVybV82NDEuZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNjQxLmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogZXhwcl82NDJ9KTtcbiAgfVxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybV82NDMpIHtcbiAgICBsZXQgZXhwcl82NDQgPSB0ZXJtXzY0My5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82NDMuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBleHByXzY0NH0pO1xuICB9XG4gIGV4cGFuZFdoaWxlU3RhdGVtZW50KHRlcm1fNjQ1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRoaXMuZXhwYW5kKHRlcm1fNjQ1LnRlc3QpLCBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtXzY0NS5ib2R5KX0pO1xuICB9XG4gIGV4cGFuZElmU3RhdGVtZW50KHRlcm1fNjQ2KSB7XG4gICAgbGV0IGNvbnNlcXVlbnRfNjQ3ID0gdGVybV82NDYuY29uc2VxdWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNjQ2LmNvbnNlcXVlbnQpO1xuICAgIGxldCBhbHRlcm5hdGVfNjQ4ID0gdGVybV82NDYuYWx0ZXJuYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82NDYuYWx0ZXJuYXRlKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGhpcy5leHBhbmQodGVybV82NDYudGVzdCksIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfNjQ3LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV82NDh9KTtcbiAgfVxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtXzY0OSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5leHBhbmQodGVybV82NDkuYmxvY2spfSk7XG4gIH1cbiAgZXhwYW5kQmxvY2sodGVybV82NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogdGVybV82NTAuc3RhdGVtZW50cy5tYXAocyA9PiB0aGlzLmV4cGFuZChzKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCh0ZXJtXzY1MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtXzY1MS5kZWNsYXJhdGlvbil9KTtcbiAgfVxuICBleHBhbmRSZXR1cm5TdGF0ZW1lbnQodGVybV82NTIpIHtcbiAgICBpZiAodGVybV82NTIuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGVybV82NTI7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV82NTIuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRDbGFzc0RlY2xhcmF0aW9uKHRlcm1fNjUzKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NEZWNsYXJhdGlvblwiLCB7bmFtZTogdGVybV82NTMubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm1fNjUzLm5hbWUpLCBzdXBlcjogdGVybV82NTMuc3VwZXIgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzY1My5zdXBlciksIGVsZW1lbnRzOiB0ZXJtXzY1My5lbGVtZW50cy5tYXAoZWwgPT4gdGhpcy5leHBhbmQoZWwpKS50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybV82NTQpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDbGFzc0V4cHJlc3Npb25cIiwge25hbWU6IHRlcm1fNjU0Lm5hbWUgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtXzY1NC5uYW1lKSwgc3VwZXI6IHRlcm1fNjU0LnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82NTQuc3VwZXIpLCBlbGVtZW50czogdGVybV82NTQuZWxlbWVudHMubWFwKGVsID0+IHRoaXMuZXhwYW5kKGVsKSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kQ2xhc3NFbGVtZW50KHRlcm1fNjU1KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogdGVybV82NTUuaXNTdGF0aWMsIG1ldGhvZDogdGhpcy5leHBhbmQodGVybV82NTUubWV0aG9kKX0pO1xuICB9XG4gIGV4cGFuZFRoaXNFeHByZXNzaW9uKHRlcm1fNjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fNjU2O1xuICB9XG4gIGV4cGFuZFN5bnRheFRlbXBsYXRlKHRlcm1fNjU3KSB7XG4gICAgbGV0IGV4cGFuZGVyXzY1OCA9IG5ldyBFeHBhbmRlcih0aGlzLmNvbnRleHQpO1xuICAgIGxldCByXzY1OSA9IHByb2Nlc3NUZW1wbGF0ZSh0ZXJtXzY1Ny50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyXzY2MCA9IFN5bnRheC5mcm9tU3RyaW5nKHNlcmlhbGl6ZXIud3JpdGUocl82NTkudGVtcGxhdGUpKTtcbiAgICBsZXQgY2FsbGVlXzY2MSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcInN5bnRheFRlbXBsYXRlXCIpfSk7XG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwc182NjIgPSByXzY1OS5pbnRlcnAubWFwKGkgPT4ge1xuICAgICAgbGV0IGVuZl82NjQgPSBuZXcgRW5mb3Jlc3RlcihpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmQoZW5mXzY2NC5lbmZvcmVzdChcImV4cHJlc3Npb25cIikpO1xuICAgIH0pO1xuICAgIGxldCBhcmdzXzY2MyA9IExpc3Qub2YobmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHN0cl82NjB9KSkuY29uY2F0KGV4cGFuZGVkSW50ZXJwc182NjIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV82NjEsIGFyZ3VtZW50czogYXJnc182NjN9KTtcbiAgfVxuICBleHBhbmRTeW50YXhRdW90ZSh0ZXJtXzY2NSkge1xuICAgIGxldCBzdHJfNjY2ID0gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IFN5bnRheC5mcm9tU3RyaW5nKHNlcmlhbGl6ZXIud3JpdGUodGVybV82NjUubmFtZSkpfSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRlcm1fNjY1LnRlbXBsYXRlLnRhZywgZWxlbWVudHM6IHRlcm1fNjY1LnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyXzY2NikucHVzaChuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IFwiXCJ9KSkudG9BcnJheSgpfSk7XG4gIH1cbiAgZXhwYW5kU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0ZXJtXzY2Nykge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy5leHBhbmQodGVybV82Njcub2JqZWN0KSwgcHJvcGVydHk6IHRlcm1fNjY3LnByb3BlcnR5fSk7XG4gIH1cbiAgZXhwYW5kQXJyYXlFeHByZXNzaW9uKHRlcm1fNjY4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogdGVybV82NjguZWxlbWVudHMubWFwKHQgPT4gdCA9PSBudWxsID8gdCA6IHRoaXMuZXhwYW5kKHQpKX0pO1xuICB9XG4gIGV4cGFuZEltcG9ydCh0ZXJtXzY2OSkge1xuICAgIHJldHVybiB0ZXJtXzY2OTtcbiAgfVxuICBleHBhbmRJbXBvcnROYW1lc3BhY2UodGVybV82NzApIHtcbiAgICByZXR1cm4gdGVybV82NzA7XG4gIH1cbiAgZXhwYW5kRXhwb3J0KHRlcm1fNjcxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybV82NzEuZGVjbGFyYXRpb24pfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RGVmYXVsdCh0ZXJtXzY3Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNjcyLmJvZHkpfSk7XG4gIH1cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtXzY3Mykge1xuICAgIHJldHVybiB0ZXJtXzY3MztcbiAgfVxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm1fNjc0KSB7XG4gICAgcmV0dXJuIHRlcm1fNjc0O1xuICB9XG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtXzY3NSkge1xuICAgIHJldHVybiB0ZXJtXzY3NTtcbiAgfVxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybV82NzYpIHtcbiAgICByZXR1cm4gdGVybV82NzY7XG4gIH1cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm1fNjc3KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtXzY3Ny5uYW1lKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV82NzcuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRPYmplY3RFeHByZXNzaW9uKHRlcm1fNjc4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogdGVybV82NzgucHJvcGVydGllcy5tYXAodCA9PiB0aGlzLmV4cGFuZCh0KSl9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybV82NzkpIHtcbiAgICBsZXQgaW5pdF82ODAgPSB0ZXJtXzY3OS5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybV82NzkuaW5pdCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzY3OS5iaW5kaW5nKSwgaW5pdDogaW5pdF82ODB9KTtcbiAgfVxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0aW9uKHRlcm1fNjgxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDogdGVybV82ODEua2luZCwgZGVjbGFyYXRvcnM6IHRlcm1fNjgxLmRlY2xhcmF0b3JzLm1hcChkID0+IHRoaXMuZXhwYW5kKGQpKX0pO1xuICB9XG4gIGV4cGFuZFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHRlcm1fNjgyKSB7XG4gICAgaWYgKHRlcm1fNjgyLmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzY4MyA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fNjgyLmlubmVyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF82ODQgPSBlbmZfNjgzLnBlZWsoKTtcbiAgICBsZXQgdF82ODUgPSBlbmZfNjgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0XzY4NSA9PSBudWxsIHx8IGVuZl82ODMucmVzdC5zaXplID4gMCkge1xuICAgICAgdGhyb3cgZW5mXzY4My5jcmVhdGVFcnJvcihsb29rYWhlYWRfNjg0LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leHBhbmQodF82ODUpO1xuICB9XG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtXzY4Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlVuYXJ5RXhwcmVzc2lvblwiLCB7b3BlcmF0b3I6IHRlcm1fNjg2Lm9wZXJhdG9yLCBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtXzY4Ni5vcGVyYW5kKX0pO1xuICB9XG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybV82ODcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogdGVybV82ODcuaXNQcmVmaXgsIG9wZXJhdG9yOiB0ZXJtXzY4Ny5vcGVyYXRvciwgb3BlcmFuZDogdGhpcy5leHBhbmQodGVybV82ODcub3BlcmFuZCl9KTtcbiAgfVxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm1fNjg4KSB7XG4gICAgbGV0IGxlZnRfNjg5ID0gdGhpcy5leHBhbmQodGVybV82ODgubGVmdCk7XG4gICAgbGV0IHJpZ2h0XzY5MCA9IHRoaXMuZXhwYW5kKHRlcm1fNjg4LnJpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzY4OSwgb3BlcmF0b3I6IHRlcm1fNjg4Lm9wZXJhdG9yLCByaWdodDogcmlnaHRfNjkwfSk7XG4gIH1cbiAgZXhwYW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlcm1fNjkxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtXzY5MS50ZXN0KSwgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybV82OTEuY29uc2VxdWVudCksIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybV82OTEuYWx0ZXJuYXRlKX0pO1xuICB9XG4gIGV4cGFuZE5ld1RhcmdldEV4cHJlc3Npb24odGVybV82OTIpIHtcbiAgICByZXR1cm4gdGVybV82OTI7XG4gIH1cbiAgZXhwYW5kTmV3RXhwcmVzc2lvbih0ZXJtXzY5Mykge1xuICAgIGxldCBjYWxsZWVfNjk0ID0gdGhpcy5leHBhbmQodGVybV82OTMuY2FsbGVlKTtcbiAgICBsZXQgZW5mXzY5NSA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fNjkzLmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzY5NiA9IGVuZl82OTUuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnID0+IHRoaXMuZXhwYW5kKGFyZykpO1xuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzY5NCwgYXJndW1lbnRzOiBhcmdzXzY5Ni50b0FycmF5KCl9KTtcbiAgfVxuICBleHBhbmRTdXBlcih0ZXJtXzY5Nykge1xuICAgIHJldHVybiB0ZXJtXzY5NztcbiAgfVxuICBleHBhbmRDYWxsRXhwcmVzc2lvbih0ZXJtXzY5OCkge1xuICAgIGxldCBjYWxsZWVfNjk5ID0gdGhpcy5leHBhbmQodGVybV82OTguY2FsbGVlKTtcbiAgICBsZXQgZW5mXzcwMCA9IG5ldyBFbmZvcmVzdGVyKHRlcm1fNjk4LmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzXzcwMSA9IGVuZl83MDAuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnID0+IHRoaXMuZXhwYW5kKGFyZykpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV82OTksIGFyZ3VtZW50czogYXJnc183MDF9KTtcbiAgfVxuICBleHBhbmRTcHJlYWRFbGVtZW50KHRlcm1fNzAyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83MDIuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFeHByZXNzaW9uU3RhdGVtZW50KHRlcm1fNzAzKSB7XG4gICAgbGV0IGNoaWxkXzcwNCA9IHRoaXMuZXhwYW5kKHRlcm1fNzAzLmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGNoaWxkXzcwNH0pO1xuICB9XG4gIGV4cGFuZExhYmVsZWRTdGF0ZW1lbnQodGVybV83MDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogdGVybV83MDUubGFiZWwudmFsKCksIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm1fNzA1LmJvZHkpfSk7XG4gIH1cbiAgZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzcwNiwgdHlwZV83MDcpIHtcbiAgICBsZXQgc2NvcGVfNzA4ID0gZnJlc2hTY29wZShcImZ1blwiKTtcbiAgICBsZXQgcmVkXzcwOSA9IG5ldyBBcHBseVNjb3BlSW5QYXJhbXNSZWR1Y2VyKHNjb3BlXzcwOCwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcGFyYW1zXzcxMDtcbiAgICBpZiAodHlwZV83MDcgIT09IFwiR2V0dGVyXCIgJiYgdHlwZV83MDcgIT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHBhcmFtc183MTAgPSByZWRfNzA5LnRyYW5zZm9ybSh0ZXJtXzcwNi5wYXJhbXMpO1xuICAgICAgcGFyYW1zXzcxMCA9IHRoaXMuZXhwYW5kKHBhcmFtc183MTApO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnB1c2goc2NvcGVfNzA4KTtcbiAgICBsZXQgZXhwYW5kZXJfNzExID0gbmV3IEV4cGFuZGVyKHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG1hcmtlZEJvZHlfNzEyLCBib2R5VGVybV83MTM7XG4gICAgaWYgKHRlcm1fNzA2LmJvZHkgaW5zdGFuY2VvZiBUZXJtKSB7XG4gICAgICBib2R5VGVybV83MTMgPSB0aGlzLmV4cGFuZCh0ZXJtXzcwNi5ib2R5LmFkZFNjb3BlKHNjb3BlXzcwOCwgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlZEJvZHlfNzEyID0gdGVybV83MDYuYm9keS5tYXAoYiA9PiBiLmFkZFNjb3BlKHNjb3BlXzcwOCwgdGhpcy5jb250ZXh0LmJpbmRpbmdzKSk7XG4gICAgICBib2R5VGVybV83MTMgPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogTGlzdCgpLCBzdGF0ZW1lbnRzOiBleHBhbmRlcl83MTEuZXhwYW5kKG1hcmtlZEJvZHlfNzEyKX0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIGlmICh0eXBlXzcwNyA9PT0gXCJHZXR0ZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfNzA3LCB7bmFtZTogdGhpcy5leHBhbmQodGVybV83MDYubmFtZSksIGJvZHk6IGJvZHlUZXJtXzcxM30pO1xuICAgIH0gZWxzZSBpZiAodHlwZV83MDcgPT09IFwiU2V0dGVyXCIpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzcwNywge25hbWU6IHRoaXMuZXhwYW5kKHRlcm1fNzA2Lm5hbWUpLCBwYXJhbTogdGVybV83MDYucGFyYW0sIGJvZHk6IGJvZHlUZXJtXzcxM30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV83MDcsIHtuYW1lOiB0ZXJtXzcwNi5uYW1lLCBpc0dlbmVyYXRvcjogdGVybV83MDYuaXNHZW5lcmF0b3IsIHBhcmFtczogcGFyYW1zXzcxMCwgYm9keTogYm9keVRlcm1fNzEzfSk7XG4gIH1cbiAgZXhwYW5kTWV0aG9kKHRlcm1fNzE0KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzcxNCwgXCJNZXRob2RcIik7XG4gIH1cbiAgZXhwYW5kU2V0dGVyKHRlcm1fNzE1KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzcxNSwgXCJTZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kR2V0dGVyKHRlcm1fNzE2KSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtXzcxNiwgXCJHZXR0ZXJcIik7XG4gIH1cbiAgZXhwYW5kRnVuY3Rpb25EZWNsYXJhdGlvbih0ZXJtXzcxNykge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybV83MTcsIFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiKTtcbiAgfVxuICBleHBhbmRGdW5jdGlvbkV4cHJlc3Npb24odGVybV83MTgpIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm1fNzE4LCBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiKTtcbiAgfVxuICBleHBhbmRDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uKHRlcm1fNzE5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogdGhpcy5leHBhbmQodGVybV83MTkuYmluZGluZyksIG9wZXJhdG9yOiB0ZXJtXzcxOS5vcGVyYXRvciwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83MTkuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtXzcyMCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtXzcyMC5iaW5kaW5nKSwgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybV83MjAuZXhwcmVzc2lvbil9KTtcbiAgfVxuICBleHBhbmRFbXB0eVN0YXRlbWVudCh0ZXJtXzcyMSkge1xuICAgIHJldHVybiB0ZXJtXzcyMTtcbiAgfVxuICBleHBhbmRMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24odGVybV83MjIpIHtcbiAgICByZXR1cm4gdGVybV83MjI7XG4gIH1cbiAgZXhwYW5kTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKHRlcm1fNzIzKSB7XG4gICAgcmV0dXJuIHRlcm1fNzIzO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybV83MjQpIHtcbiAgICByZXR1cm4gdGVybV83MjQ7XG4gIH1cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybV83MjUpIHtcbiAgICBsZXQgdHJhbnNfNzI2ID0gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV83MjUubmFtZS5yZXNvbHZlKCkpO1xuICAgIGlmICh0cmFuc183MjYpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0cmFuc183MjYuaWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlcm1fNzI1O1xuICB9XG4gIGV4cGFuZExpdGVyYWxOdWxsRXhwcmVzc2lvbih0ZXJtXzcyNykge1xuICAgIHJldHVybiB0ZXJtXzcyNztcbiAgfVxuICBleHBhbmRMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbih0ZXJtXzcyOCkge1xuICAgIHJldHVybiB0ZXJtXzcyODtcbiAgfVxuICBleHBhbmRMaXRlcmFsUmVnRXhwRXhwcmVzc2lvbih0ZXJtXzcyOSkge1xuICAgIHJldHVybiB0ZXJtXzcyOTtcbiAgfVxufVxuIl19