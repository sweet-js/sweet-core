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
      var field_605 = "expand" + term_604.type;if (typeof this[field_605] === "function") {
        return this[field_605](term_604);
      }(0, _errors.assert)(false, "expand not implemented yet for: " + term_604.type);
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

      var rest_616 = term_615.rest == null ? null : this.expand(term_615.rest);return new _terms2.default("FormalParameters", { items: term_615.items.map(function (i) {
          return _this3.expand(i);
        }), rest: rest_616 });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term_617) {
      var _this4 = this;

      var body_618 = void 0;if (_immutable.List.isList(term_617.body)) {
        (function () {
          var scope = (0, _scope.freshScope)("fun");_this4.context.currentScope.push(scope);var expander = new _expander2.default(_this4.context);body_618 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander.expand(term_617.body.map(function (s) {
              return s.addScope(scope, _this4.context.bindings);
            })) });_this4.context.currentScope.pop();
        })();
      } else {
        body_618 = this.expand(term_617.body);
      }return new _terms2.default("ArrowExpression", { params: this.expand(term_617.params), body: body_618 });
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term_619) {
      var _this5 = this;

      return new _terms2.default("SwitchDefault", { consequent: term_619.consequent.map(function (c) {
          return _this5.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term_620) {
      var _this6 = this;

      return new _terms2.default("SwitchCase", { test: this.expand(term_620.test), consequent: term_620.consequent.map(function (c) {
          return _this6.expand(c);
        }).toArray() });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term_621) {
      return new _terms2.default("ForInStatement", { left: this.expand(term_621.left), right: this.expand(term_621.right), body: this.expand(term_621.body) });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term_622) {
      return new _terms2.default("TryCatchStatement", { body: this.expand(term_622.body), catchClause: this.expand(term_622.catchClause) });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term_623) {
      var catchClause_624 = term_623.catchClause == null ? null : this.expand(term_623.catchClause);return new _terms2.default("TryFinallyStatement", { body: this.expand(term_623.body), catchClause: catchClause_624, finalizer: this.expand(term_623.finalizer) });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term_625) {
      return new _terms2.default("CatchClause", { binding: this.expand(term_625.binding), body: this.expand(term_625.body) });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term_626) {
      return new _terms2.default("ThrowStatement", { expression: this.expand(term_626.expression) });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term_627) {
      return new _terms2.default("ForOfStatement", { left: this.expand(term_627.left), right: this.expand(term_627.right), body: this.expand(term_627.body) });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term_628) {
      return term_628;
    }
  }, {
    key: "expandBindingPropertyIdentifier",
    value: function expandBindingPropertyIdentifier(term_629) {
      return term_629;
    }
  }, {
    key: "expandBindingPropertyProperty",
    value: function expandBindingPropertyProperty(term_630) {
      return new _terms2.default("BindingPropertyProperty", { name: this.expand(term_630.name), binding: this.expand(term_630.binding) });
    }
  }, {
    key: "expandComputedPropertyName",
    value: function expandComputedPropertyName(term_631) {
      return new _terms2.default("ComputedPropertyName", { expression: this.expand(term_631.expression) });
    }
  }, {
    key: "expandObjectBinding",
    value: function expandObjectBinding(term_632) {
      var _this7 = this;

      return new _terms2.default("ObjectBinding", { properties: term_632.properties.map(function (t) {
          return _this7.expand(t);
        }).toArray() });
    }
  }, {
    key: "expandArrayBinding",
    value: function expandArrayBinding(term_633) {
      var _this8 = this;

      var restElement_634 = term_633.restElement == null ? null : this.expand(term_633.restElement);return new _terms2.default("ArrayBinding", { elements: term_633.elements.map(function (t) {
          return t == null ? null : _this8.expand(t);
        }).toArray(), restElement: restElement_634 });
    }
  }, {
    key: "expandBindingWithDefault",
    value: function expandBindingWithDefault(term_635) {
      return new _terms2.default("BindingWithDefault", { binding: this.expand(term_635.binding), init: this.expand(term_635.init) });
    }
  }, {
    key: "expandShorthandProperty",
    value: function expandShorthandProperty(term_636) {
      return new _terms2.default("DataProperty", { name: new _terms2.default("StaticPropertyName", { value: term_636.name }), expression: new _terms2.default("IdentifierExpression", { name: term_636.name }) });
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term_637) {
      var init_638 = term_637.init == null ? null : this.expand(term_637.init);var test_639 = term_637.test == null ? null : this.expand(term_637.test);var update_640 = term_637.update == null ? null : this.expand(term_637.update);var body_641 = this.expand(term_637.body);return new _terms2.default("ForStatement", { init: init_638, test: test_639, update: update_640, body: body_641 });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term_642) {
      var expr_643 = term_642.expression == null ? null : this.expand(term_642.expression);return new _terms2.default("YieldExpression", { expression: expr_643 });
    }
  }, {
    key: "expandYieldGeneratorExpression",
    value: function expandYieldGeneratorExpression(term_644) {
      var expr_645 = term_644.expression == null ? null : this.expand(term_644.expression);return new _terms2.default("YieldGeneratorExpression", { expression: expr_645 });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term_646) {
      return new _terms2.default("WhileStatement", { test: this.expand(term_646.test), body: this.expand(term_646.body) });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term_647) {
      var consequent_648 = term_647.consequent == null ? null : this.expand(term_647.consequent);var alternate_649 = term_647.alternate == null ? null : this.expand(term_647.alternate);return new _terms2.default("IfStatement", { test: this.expand(term_647.test), consequent: consequent_648, alternate: alternate_649 });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term_650) {
      return new _terms2.default("BlockStatement", { block: this.expand(term_650.block) });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term_651) {
      var _this9 = this;

      return new _terms2.default("Block", { statements: term_651.statements.map(function (s) {
          return _this9.expand(s);
        }).toArray() });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term_652) {
      return new _terms2.default("VariableDeclarationStatement", { declaration: this.expand(term_652.declaration) });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term_653) {
      if (term_653.expression == null) {
        return term_653;
      }return new _terms2.default("ReturnStatement", { expression: this.expand(term_653.expression) });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term_654) {
      var _this10 = this;

      return new _terms2.default("ClassDeclaration", { name: term_654.name == null ? null : this.expand(term_654.name), super: term_654.super == null ? null : this.expand(term_654.super), elements: term_654.elements.map(function (el) {
          return _this10.expand(el);
        }).toArray() });
    }
  }, {
    key: "expandClassExpression",
    value: function expandClassExpression(term_655) {
      var _this11 = this;

      return new _terms2.default("ClassExpression", { name: term_655.name == null ? null : this.expand(term_655.name), super: term_655.super == null ? null : this.expand(term_655.super), elements: term_655.elements.map(function (el) {
          return _this11.expand(el);
        }).toArray() });
    }
  }, {
    key: "expandClassElement",
    value: function expandClassElement(term_656) {
      return new _terms2.default("ClassElement", { isStatic: term_656.isStatic, method: this.expand(term_656.method) });
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term_657) {
      return term_657;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term_658) {
      var _this12 = this;

      var expander_659 = new _expander2.default(this.context);var r_660 = (0, _templateProcessor.processTemplate)(term_658.template.inner());var str_661 = _syntax2.default.fromString(_serializer.serializer.write(r_660.template));var callee_662 = new _terms2.default("IdentifierExpression", { name: _syntax2.default.fromIdentifier("syntaxTemplate") });var expandedInterps_663 = r_660.interp.map(function (i) {
        var enf_665 = new _enforester.Enforester(i, (0, _immutable.List)(), _this12.context);return _this12.expand(enf_665.enforest("expression"));
      });var args_664 = _immutable.List.of(new _terms2.default("LiteralStringExpression", { value: str_661 })).concat(expandedInterps_663);return new _terms2.default("CallExpression", { callee: callee_662, arguments: args_664 });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term_666) {
      var str_667 = new _terms2.default("LiteralStringExpression", { value: _syntax2.default.fromString(_serializer.serializer.write(term_666.name)) });return new _terms2.default("TemplateExpression", { tag: term_666.template.tag, elements: term_666.template.elements.push(str_667).push(new _terms2.default("TemplateElement", { rawValue: "" })).toArray() });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term_668) {
      return new _terms2.default("StaticMemberExpression", { object: this.expand(term_668.object), property: term_668.property });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term_669) {
      var _this13 = this;

      return new _terms2.default("ArrayExpression", { elements: term_669.elements.map(function (t) {
          return t == null ? t : _this13.expand(t);
        }) });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term_670) {
      return term_670;
    }
  }, {
    key: "expandImportNamespace",
    value: function expandImportNamespace(term_671) {
      return term_671;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term_672) {
      return new _terms2.default("Export", { declaration: this.expand(term_672.declaration) });
    }
  }, {
    key: "expandExportDefault",
    value: function expandExportDefault(term_673) {
      return new _terms2.default("ExportDefault", { body: this.expand(term_673.body) });
    }
  }, {
    key: "expandExportFrom",
    value: function expandExportFrom(term_674) {
      return term_674;
    }
  }, {
    key: "expandExportAllFrom",
    value: function expandExportAllFrom(term_675) {
      return term_675;
    }
  }, {
    key: "expandExportSpecifier",
    value: function expandExportSpecifier(term_676) {
      return term_676;
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term_677) {
      return term_677;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term_678) {
      return new _terms2.default("DataProperty", { name: this.expand(term_678.name), expression: this.expand(term_678.expression) });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term_679) {
      var _this14 = this;

      return new _terms2.default("ObjectExpression", { properties: term_679.properties.map(function (t) {
          return _this14.expand(t);
        }) });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term_680) {
      var init_681 = term_680.init == null ? null : this.expand(term_680.init);return new _terms2.default("VariableDeclarator", { binding: this.expand(term_680.binding), init: init_681 });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term_682) {
      var _this15 = this;

      return new _terms2.default("VariableDeclaration", { kind: term_682.kind, declarators: term_682.declarators.map(function (d) {
          return _this15.expand(d);
        }) });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term_683) {
      if (term_683.inner.size === 0) {
        throw new Error("unexpected end of input");
      }var enf_684 = new _enforester.Enforester(term_683.inner, (0, _immutable.List)(), this.context);var lookahead_685 = enf_684.peek();var t_686 = enf_684.enforestExpression();if (t_686 == null || enf_684.rest.size > 0) {
        throw enf_684.createError(lookahead_685, "unexpected syntax");
      }return this.expand(t_686);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term_687) {
      return new _terms2.default("UnaryExpression", { operator: term_687.operator, operand: this.expand(term_687.operand) });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term_688) {
      return new _terms2.default("UpdateExpression", { isPrefix: term_688.isPrefix, operator: term_688.operator, operand: this.expand(term_688.operand) });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term_689) {
      var left_690 = this.expand(term_689.left);var right_691 = this.expand(term_689.right);return new _terms2.default("BinaryExpression", { left: left_690, operator: term_689.operator, right: right_691 });
    }
  }, {
    key: "expandConditionalExpression",
    value: function expandConditionalExpression(term_692) {
      return new _terms2.default("ConditionalExpression", { test: this.expand(term_692.test), consequent: this.expand(term_692.consequent), alternate: this.expand(term_692.alternate) });
    }
  }, {
    key: "expandNewTargetExpression",
    value: function expandNewTargetExpression(term_693) {
      return term_693;
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term_694) {
      var _this16 = this;

      var callee_695 = this.expand(term_694.callee);var enf_696 = new _enforester.Enforester(term_694.arguments, (0, _immutable.List)(), this.context);var args_697 = enf_696.enforestArgumentList().map(function (arg) {
        return _this16.expand(arg);
      });return new _terms2.default("NewExpression", { callee: callee_695, arguments: args_697.toArray() });
    }
  }, {
    key: "expandSuper",
    value: function expandSuper(term_698) {
      return term_698;
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term_699) {
      var _this17 = this;

      var callee_700 = this.expand(term_699.callee);var enf_701 = new _enforester.Enforester(term_699.arguments, (0, _immutable.List)(), this.context);var args_702 = enf_701.enforestArgumentList().map(function (arg) {
        return _this17.expand(arg);
      });return new _terms2.default("CallExpression", { callee: callee_700, arguments: args_702 });
    }
  }, {
    key: "expandSpreadElement",
    value: function expandSpreadElement(term_703) {
      return new _terms2.default("SpreadElement", { expression: this.expand(term_703.expression) });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term_704) {
      var child_705 = this.expand(term_704.expression);return new _terms2.default("ExpressionStatement", { expression: child_705 });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term_706) {
      return new _terms2.default("LabeledStatement", { label: term_706.label.val(), body: this.expand(term_706.body) });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term_707, type_708) {
      var _this18 = this;

      var scope_709 = (0, _scope.freshScope)("fun");var markedBody_710 = term_707.body.map(function (b) {
        return b.addScope(scope_709, _this18.context.bindings);
      });var red_711 = new _applyScopeInParamsReducer2.default(scope_709, this.context);var params_712 = void 0;if (type_708 !== "Getter" && type_708 !== "Setter") {
        params_712 = red_711.transform(term_707.params);params_712 = this.expand(params_712);
      }this.context.currentScope.push(scope_709);var expander_713 = new _expander2.default(this.context);var bodyTerm_714 = new _terms2.default("FunctionBody", { directives: (0, _immutable.List)(), statements: expander_713.expand(markedBody_710) });this.context.currentScope.pop();if (type_708 === "Getter") {
        return new _terms2.default(type_708, { name: this.expand(term_707.name), body: bodyTerm_714 });
      } else if (type_708 === "Setter") {
        return new _terms2.default(type_708, { name: this.expand(term_707.name), param: term_707.param, body: bodyTerm_714 });
      }return new _terms2.default(type_708, { name: term_707.name, isGenerator: term_707.isGenerator, params: params_712, body: bodyTerm_714 });
    }
  }, {
    key: "expandMethod",
    value: function expandMethod(term_715) {
      return this.doFunctionExpansion(term_715, "Method");
    }
  }, {
    key: "expandSetter",
    value: function expandSetter(term_716) {
      return this.doFunctionExpansion(term_716, "Setter");
    }
  }, {
    key: "expandGetter",
    value: function expandGetter(term_717) {
      return this.doFunctionExpansion(term_717, "Getter");
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term_718) {
      return this.doFunctionExpansion(term_718, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term_719) {
      return this.doFunctionExpansion(term_719, "FunctionExpression");
    }
  }, {
    key: "expandCompoundAssignmentExpression",
    value: function expandCompoundAssignmentExpression(term_720) {
      return new _terms2.default("CompoundAssignmentExpression", { binding: this.expand(term_720.binding), operator: term_720.operator, expression: this.expand(term_720.expression) });
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term_721) {
      return new _terms2.default("AssignmentExpression", { binding: this.expand(term_721.binding), expression: this.expand(term_721.expression) });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term_722) {
      return term_722;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term_723) {
      return term_723;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term_724) {
      return term_724;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term_725) {
      return term_725;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term_726) {
      var trans_727 = this.context.env.get(term_726.name.resolve());if (trans_727) {
        return new _terms2.default("IdentifierExpression", { name: trans_727.id });
      }return term_726;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term_728) {
      return term_728;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term_729) {
      return term_729;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term_730) {
      return term_730;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=term-expander.js.map
