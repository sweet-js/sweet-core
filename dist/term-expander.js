"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function expandExpressionList(stxl, context) {
  var result = (0, _immutable.List)();
  var prev = (0, _immutable.List)();
  if (stxl.size === 0) {
    return (0, _immutable.List)();
  }
  var enf = new _enforester.Enforester(stxl, prev, context);
  var lastTerm = null;
  while (!enf.done) {
    var term = enf.enforest("expression");
    if (term == null) {
      throw enf.createError(null, "expecting an expression");
    }
    result = result.concat(term);

    if (!enf.isPunctuator(enf.peek(), ",") && enf.rest.size !== 0) {
      throw enf.createError(enf.peek(), "expecting a comma");
    }
    enf.advance();
  }
  var te = new TermExpander(context);
  return result.map(function (t) {
    return te.expand(t);
  });
}

var TermExpander = function () {
  function TermExpander(context) {
    _classCallCheck(this, TermExpander);

    this.context = context;
  }

  _createClass(TermExpander, [{
    key: "expand",
    value: function expand(term) {
      var field = "expand" + term.type;
      if (typeof this[field] === 'function') {
        return this[field](term);
      }
      (0, _errors.assert)(false, "expand not implemented yet for: " + term.type);
    }
  }, {
    key: "expandTemplateExpression",
    value: function expandTemplateExpression(term) {
      return new _terms2.default('TemplateExpression', {
        tag: term.tag,
        elements: term.elements.toArray()
      });
    }
  }, {
    key: "expandBreakStatement",
    value: function expandBreakStatement(term) {
      return new _terms2.default('BreakStatement', {
        label: term.label ? term.label.val() : null
      });
    }
  }, {
    key: "expandDoWhileStatement",
    value: function expandDoWhileStatement(term) {
      return new _terms2.default('DoWhileStatement', {
        body: this.expand(term.body),
        test: this.expand(term.test)
      });
    }
  }, {
    key: "expandWithStatement",
    value: function expandWithStatement(term) {
      return new _terms2.default('WithStatement', {
        body: this.expand(term.body),
        object: this.expand(term.object)
      });
    }
  }, {
    key: "expandDebuggerStatement",
    value: function expandDebuggerStatement(term) {
      return term;
    }
  }, {
    key: "expandContinueStatement",
    value: function expandContinueStatement(term) {
      return new _terms2.default('ContinueStatement', {
        label: term.label ? term.label.val() : null
      });
    }
  }, {
    key: "expandSwitchStatementWithDefault",
    value: function expandSwitchStatementWithDefault(term) {
      var _this = this;

      return new _terms2.default('SwitchStatementWithDefault', {
        discriminant: this.expand(term.discriminant),
        preDefaultCases: term.preDefaultCases.map(function (c) {
          return _this.expand(c);
        }).toArray(),
        defaultCase: this.expand(term.defaultCase),
        postDefaultCases: term.postDefaultCases.map(function (c) {
          return _this.expand(c);
        }).toArray()
      });
    }
  }, {
    key: "expandComputedMemberExpression",
    value: function expandComputedMemberExpression(term) {
      return new _terms2.default('ComputedMemberExpression', {
        object: this.expand(term.object),
        expression: this.expand(term.expression)
      });
    }
  }, {
    key: "expandSwitchStatement",
    value: function expandSwitchStatement(term) {
      var _this2 = this;

      return new _terms2.default('SwitchStatement', {
        discriminant: this.expand(term.discriminant),
        cases: term.cases.map(function (c) {
          return _this2.expand(c);
        }).toArray()
      });
    }
  }, {
    key: "expandFormalParameters",
    value: function expandFormalParameters(term) {
      var _this3 = this;

      var rest = term.rest == null ? null : this.expand(term.rest);
      return new _terms2.default('FormalParameters', {
        items: term.items.map(function (i) {
          return _this3.expand(i);
        }),
        rest: rest
      });
    }
  }, {
    key: "expandArrowExpression",
    value: function expandArrowExpression(term) {
      var _this4 = this;

      var body = undefined;
      if (_immutable.List.isList(term.body)) {
        (function () {
          var scope = (0, _scope.freshScope)('fun');
          _this4.context.currentScope.push(scope);
          var expander = new _expander2.default(_this4.context);

          body = new _terms2.default("FunctionBody", {
            directives: (0, _immutable.List)(),
            statements: expander.expand(term.body.map(function (s) {
              return s.addScope(scope, _this4.context.bindings);
            }))
          });
          _this4.context.currentScope.pop();
        })();
      } else {
        body = this.expand(term.body);
      }
      return new _terms2.default('ArrowExpression', {
        // TODO: hygiene
        params: this.expand(term.params),
        body: body
      });
    }
  }, {
    key: "expandSwitchDefault",
    value: function expandSwitchDefault(term) {
      var _this5 = this;

      return new _terms2.default('SwitchDefault', {
        consequent: term.consequent.map(function (c) {
          return _this5.expand(c);
        }).toArray()
      });
    }
  }, {
    key: "expandSwitchCase",
    value: function expandSwitchCase(term) {
      var _this6 = this;

      return new _terms2.default('SwitchCase', {
        test: this.expand(term.test),
        consequent: term.consequent.map(function (c) {
          return _this6.expand(c);
        }).toArray()
      });
    }
  }, {
    key: "expandForInStatement",
    value: function expandForInStatement(term) {
      return new _terms2.default('ForInStatement', {
        left: this.expand(term.left),
        right: this.expand(term.right),
        body: this.expand(term.body)
      });
    }
  }, {
    key: "expandTryCatchStatement",
    value: function expandTryCatchStatement(term) {
      return new _terms2.default('TryCatchStatement', {
        body: this.expand(term.body),
        catchClause: this.expand(term.catchClause)
      });
    }
  }, {
    key: "expandTryFinallyStatement",
    value: function expandTryFinallyStatement(term) {
      var catchClause = term.catchClause == null ? null : this.expand(term.catchClause);
      return new _terms2.default('TryFinallyStatement', {
        body: this.expand(term.body),
        catchClause: catchClause,
        finalizer: this.expand(term.finalizer)
      });
    }
  }, {
    key: "expandCatchClause",
    value: function expandCatchClause(term) {
      return new _terms2.default('CatchClause', {
        binding: this.expand(term.binding),
        body: this.expand(term.body)
      });
    }
  }, {
    key: "expandThrowStatement",
    value: function expandThrowStatement(term) {
      return new _terms2.default('ThrowStatement', {
        expression: this.expand(term.expression)
      });
    }
  }, {
    key: "expandForOfStatement",
    value: function expandForOfStatement(term) {
      return new _terms2.default('ForOfStatement', {
        left: this.expand(term.left),
        right: this.expand(term.right),
        body: this.expand(term.body)
      });
    }
  }, {
    key: "expandBindingIdentifier",
    value: function expandBindingIdentifier(term) {
      return term;
    }
  }, {
    key: "expandForStatement",
    value: function expandForStatement(term) {
      var init = term.init == null ? null : this.expand(term.init);
      var test = term.test == null ? null : this.expand(term.test);
      var update = term.update == null ? null : this.expand(term.update);
      var body = this.expand(term.body);
      return new _terms2.default('ForStatement', { init: init, test: test, update: update, body: body });
    }
  }, {
    key: "expandYieldExpression",
    value: function expandYieldExpression(term) {
      var expr = term.expression == null ? null : this.expand(term.expression);
      return new _terms2.default('YieldExpression', {
        expression: expr
      });
    }
  }, {
    key: "expandWhileStatement",
    value: function expandWhileStatement(term) {
      return new _terms2.default('WhileStatement', {
        test: this.expand(term.test),
        body: this.expand(term.body)
      });
    }
  }, {
    key: "expandIfStatement",
    value: function expandIfStatement(term) {
      var consequent = term.consequent == null ? null : this.expand(term.consequent);
      var alternate = term.alternate == null ? null : this.expand(term.alternate);
      return new _terms2.default('IfStatement', {
        test: this.expand(term.test),
        consequent: consequent,
        alternate: alternate
      });
    }
  }, {
    key: "expandBlockStatement",
    value: function expandBlockStatement(term) {
      return new _terms2.default('BlockStatement', {
        block: this.expand(term.block)
      });
    }
  }, {
    key: "expandBlock",
    value: function expandBlock(term) {
      var _this7 = this;

      return new _terms2.default('Block', {
        statements: term.statements.map(function (s) {
          return _this7.expand(s);
        }).toArray()
      });
    }
  }, {
    key: "expandVariableDeclarationStatement",
    value: function expandVariableDeclarationStatement(term) {
      return new _terms2.default('VariableDeclarationStatement', {
        declaration: this.expand(term.declaration)
      });
    }
  }, {
    key: "expandReturnStatement",
    value: function expandReturnStatement(term) {
      if (term.expression == null) {
        return term;
      }
      return new _terms2.default("ReturnStatement", {
        expression: this.expand(term.expression)
      });
    }
  }, {
    key: "expandClassDeclaration",
    value: function expandClassDeclaration(term) {
      return term;
    }
  }, {
    key: "expandThisExpression",
    value: function expandThisExpression(term) {
      return term;
    }
  }, {
    key: "expandSyntaxTemplate",
    value: function expandSyntaxTemplate(term) {
      var _this8 = this;

      var expander = new _expander2.default(this.context);
      var r = (0, _templateProcessor.processTemplate)(term.template.inner());
      var str = _syntax2.default.fromString(_serializer.serializer.write(r.template));
      var callee = new _terms2.default('IdentifierExpression', { name: _syntax2.default.fromIdentifier('syntaxTemplate') });

      var expandedInterps = r.interp.map(function (i) {
        var enf = new _enforester.Enforester(i, (0, _immutable.List)(), _this8.context);
        return _this8.expand(enf.enforest('expression'));
      });

      var args = _immutable.List.of(new _terms2.default('LiteralStringExpression', { value: str })).concat(expandedInterps);

      return new _terms2.default('CallExpression', {
        callee: callee, arguments: args
      });
    }
  }, {
    key: "expandSyntaxQuote",
    value: function expandSyntaxQuote(term) {
      var str = new _terms2.default("LiteralStringExpression", {
        value: _syntax2.default.fromString(_serializer.serializer.write(term.name))
      });

      return new _terms2.default("TemplateExpression", {
        tag: term.template.tag,
        elements: term.template.elements.push(str).push(new _terms2.default('TemplateElement', {
          rawValue: ''
        })).toArray()
      });
    }
  }, {
    key: "expandStaticMemberExpression",
    value: function expandStaticMemberExpression(term) {
      return new _terms2.default("StaticMemberExpression", {
        object: this.expand(term.object),
        property: term.property
      });
    }
  }, {
    key: "expandArrayExpression",
    value: function expandArrayExpression(term) {
      var _this9 = this;

      return new _terms2.default("ArrayExpression", {
        elements: term.elements.map(function (t) {
          return t == null ? t : _this9.expand(t);
        })
      });
    }
  }, {
    key: "expandImport",
    value: function expandImport(term) {
      return term;
    }
  }, {
    key: "expandExport",
    value: function expandExport(term) {
      return new _terms2.default('Export', {
        declaration: this.expand(term.declaration)
      });
    }
  }, {
    key: "expandStaticPropertyName",
    value: function expandStaticPropertyName(term) {
      return term;
    }
  }, {
    key: "expandDataProperty",
    value: function expandDataProperty(term) {
      return new _terms2.default("DataProperty", {
        name: this.expand(term.name),
        expression: this.expand(term.expression)
      });
    }
  }, {
    key: "expandObjectExpression",
    value: function expandObjectExpression(term) {
      var _this10 = this;

      return new _terms2.default("ObjectExpression", {
        properties: term.properties.map(function (t) {
          return _this10.expand(t);
        })
      });
    }
  }, {
    key: "expandVariableDeclarator",
    value: function expandVariableDeclarator(term) {
      var init = term.init == null ? null : this.expand(term.init);
      return new _terms2.default("VariableDeclarator", {
        binding: term.binding,
        init: init
      });
    }
  }, {
    key: "expandVariableDeclaration",
    value: function expandVariableDeclaration(term) {
      var _this11 = this;

      return new _terms2.default("VariableDeclaration", {
        kind: term.kind,
        declarators: term.declarators.map(function (d) {
          return _this11.expand(d);
        })
      });
    }
  }, {
    key: "expandParenthesizedExpression",
    value: function expandParenthesizedExpression(term) {
      var enf = new _enforester.Enforester(term.inner, (0, _immutable.List)(), this.context);
      var t = enf.enforest("expression");
      if (!enf.done || t == null) {
        throw enf.createError(enf.peek(), "unexpected syntax");
      }
      return this.expand(t);
    }
  }, {
    key: "expandUnaryExpression",
    value: function expandUnaryExpression(term) {
      return new _terms2.default('UnaryExpression', {
        operator: term.operator,
        operand: this.expand(term.operand)
      });
    }
  }, {
    key: "expandUpdateExpression",
    value: function expandUpdateExpression(term) {
      return new _terms2.default('UpdateExpression', {
        isPrefix: term.isPrefix,
        operator: term.operator,
        operand: this.expand(term.operand)
      });
    }
  }, {
    key: "expandBinaryExpression",
    value: function expandBinaryExpression(term) {
      var left = this.expand(term.left);
      var right = this.expand(term.right);
      return new _terms2.default("BinaryExpression", {
        left: left,
        operator: term.operator,
        right: right
      });
    }
  }, {
    key: "expandNewExpression",
    value: function expandNewExpression(term) {
      var callee = this.expand(term.callee);
      var args = expandExpressionList(term.arguments, this.context);
      return new _terms2.default('NewExpression', {
        callee: callee,
        arguments: args.toArray()
      });
    }
  }, {
    key: "expandCallExpression",
    value: function expandCallExpression(term) {
      var callee = this.expand(term.callee);
      var args = expandExpressionList(term.arguments, this.context);
      return new _terms2.default("CallExpression", {
        callee: callee,
        arguments: args
      });
    }
  }, {
    key: "expandExpressionStatement",
    value: function expandExpressionStatement(term) {
      var child = this.expand(term.expression);
      return new _terms2.default("ExpressionStatement", {
        expression: child
      });
    }
  }, {
    key: "expandLabeledStatement",
    value: function expandLabeledStatement(term) {
      return new _terms2.default('LabeledStatement', {
        label: term.label.val(),
        body: this.expand(term.body)
      });
    }
  }, {
    key: "doFunctionExpansion",
    value: function doFunctionExpansion(term, type) {
      var _this12 = this;

      var scope = (0, _scope.freshScope)("fun");
      var markedBody = term.body.map(function (b) {
        return b.addScope(scope, _this12.context.bindings);
      });
      var red = new _applyScopeInParamsReducer2.default(scope, this.context);
      var params = (0, _shiftReducer2.default)(red, term.params);
      this.context.currentScope.push(scope);
      var expander = new _expander2.default(this.context);

      var bodyTerm = new _terms2.default("FunctionBody", {
        directives: (0, _immutable.List)(),
        statements: expander.expand(markedBody)
      });
      this.context.currentScope.pop();

      return new _terms2.default(type, {
        name: term.name,
        isGenerator: term.isGenerator,
        params: params,
        body: bodyTerm
      });
    }
  }, {
    key: "expandFunctionDeclaration",
    value: function expandFunctionDeclaration(term) {
      return this.doFunctionExpansion(term, "FunctionDeclaration");
    }
  }, {
    key: "expandFunctionExpression",
    value: function expandFunctionExpression(term) {
      return this.doFunctionExpansion(term, "FunctionExpression");
    }
  }, {
    key: "expandAssignmentExpression",
    value: function expandAssignmentExpression(term) {
      return new _terms2.default("AssignmentExpression", {
        binding: term.binding,
        expression: this.expand(term.expression)
      });
    }
  }, {
    key: "expandEmptyStatement",
    value: function expandEmptyStatement(term) {
      return term;
    }
  }, {
    key: "expandLiteralBooleanExpression",
    value: function expandLiteralBooleanExpression(term) {
      return term;
    }
  }, {
    key: "expandLiteralNumericExpression",
    value: function expandLiteralNumericExpression(term) {
      return term;
    }
  }, {
    key: "expandLiteralInfinityExpression",
    value: function expandLiteralInfinityExpression(term) {
      return term;
    }
  }, {
    key: "expandIdentifierExpression",
    value: function expandIdentifierExpression(term) {
      var trans = this.context.env.get(term.name.resolve());
      if (trans) {
        return new _terms2.default("IdentifierExpression", {
          name: trans.id
        });
      }
      return term;
    }
  }, {
    key: "expandLiteralNullExpression",
    value: function expandLiteralNullExpression(term) {
      return term;
    }
  }, {
    key: "expandLiteralStringExpression",
    value: function expandLiteralStringExpression(term) {
      return term;
    }
  }, {
    key: "expandLiteralRegExpExpression",
    value: function expandLiteralRegExpExpression(term) {
      return term;
    }
  }]);

  return TermExpander;
}();

exports.default = TermExpander;
//# sourceMappingURL=term-expander.js.map
