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

var _compiler = require("./compiler");

var _compiler2 = _interopRequireDefault(_compiler);

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _serializer = require("./serializer");

var _enforester = require("./enforester");

var _templateProcessor = require("./template-processor.js");

var _astDispatcher = require("./ast-dispatcher");

var _astDispatcher2 = _interopRequireDefault(_astDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TermExpander extends _astDispatcher2.default {
  constructor(context) {
    super('expand', true);
    this.context = context;
  }

  expand(term) {
    return this.dispatch(term);
  }

  expandPragma(term) {
    return term;
  }

  expandTemplateExpression(term) {
    return new _terms2.default('TemplateExpression', {
      tag: term.tag == null ? null : this.expand(term.tag),
      elements: term.elements.toArray()
    });
  }

  expandBreakStatement(term) {
    return new _terms2.default('BreakStatement', {
      label: term.label ? term.label.val() : null
    });
  }

  expandDoWhileStatement(term) {
    return new _terms2.default('DoWhileStatement', {
      body: this.expand(term.body),
      test: this.expand(term.test)
    });
  }

  expandWithStatement(term) {
    return new _terms2.default('WithStatement', {
      body: this.expand(term.body),
      object: this.expand(term.object)
    });
  }

  expandDebuggerStatement(term) {
    return term;
  }

  expandContinueStatement(term) {
    return new _terms2.default('ContinueStatement', {
      label: term.label ? term.label.val() : null
    });
  }

  expandSwitchStatementWithDefault(term) {
    return new _terms2.default('SwitchStatementWithDefault', {
      discriminant: this.expand(term.discriminant),
      preDefaultCases: term.preDefaultCases.map(c => this.expand(c)).toArray(),
      defaultCase: this.expand(term.defaultCase),
      postDefaultCases: term.postDefaultCases.map(c => this.expand(c)).toArray()
    });
  }

  expandComputedMemberExpression(term) {
    return new _terms2.default('ComputedMemberExpression', {
      object: this.expand(term.object),
      expression: this.expand(term.expression)
    });
  }

  expandSwitchStatement(term) {
    return new _terms2.default('SwitchStatement', {
      discriminant: this.expand(term.discriminant),
      cases: term.cases.map(c => this.expand(c)).toArray()
    });
  }

  expandFormalParameters(term) {
    let rest = term.rest == null ? null : this.expand(term.rest);
    return new _terms2.default('FormalParameters', {
      items: term.items.map(i => this.expand(i)),
      rest: rest
    });
  }

  expandArrowExpression(term) {
    return this.doFunctionExpansion(term, 'ArrowExpression');
  }

  expandSwitchDefault(term) {
    return new _terms2.default('SwitchDefault', {
      consequent: term.consequent.map(c => this.expand(c)).toArray()
    });
  }

  expandSwitchCase(term) {
    return new _terms2.default('SwitchCase', {
      test: this.expand(term.test),
      consequent: term.consequent.map(c => this.expand(c)).toArray()
    });
  }

  expandForInStatement(term) {
    return new _terms2.default('ForInStatement', {
      left: this.expand(term.left),
      right: this.expand(term.right),
      body: this.expand(term.body)
    });
  }

  expandTryCatchStatement(term) {
    return new _terms2.default('TryCatchStatement', {
      body: this.expand(term.body),
      catchClause: this.expand(term.catchClause)
    });
  }

  expandTryFinallyStatement(term) {
    let catchClause = term.catchClause == null ? null : this.expand(term.catchClause);
    return new _terms2.default('TryFinallyStatement', {
      body: this.expand(term.body),
      catchClause: catchClause,
      finalizer: this.expand(term.finalizer)
    });
  }

  expandCatchClause(term) {
    return new _terms2.default('CatchClause', {
      binding: this.expand(term.binding),
      body: this.expand(term.body)
    });
  }

  expandThrowStatement(term) {
    return new _terms2.default('ThrowStatement', {
      expression: this.expand(term.expression)
    });
  }

  expandForOfStatement(term) {
    return new _terms2.default('ForOfStatement', {
      left: this.expand(term.left),
      right: this.expand(term.right),
      body: this.expand(term.body)
    });
  }

  expandBindingIdentifier(term) {
    return term;
  }

  expandBindingPropertyIdentifier(term) {
    return term;
  }
  expandBindingPropertyProperty(term) {
    return new _terms2.default('BindingPropertyProperty', {
      name: this.expand(term.name),
      binding: this.expand(term.binding)
    });
  }

  expandComputedPropertyName(term) {
    return new _terms2.default('ComputedPropertyName', {
      expression: this.expand(term.expression)
    });
  }

  expandObjectBinding(term) {
    return new _terms2.default('ObjectBinding', {
      properties: term.properties.map(t => this.expand(t)).toArray()
    });
  }

  expandArrayBinding(term) {
    let restElement = term.restElement == null ? null : this.expand(term.restElement);
    return new _terms2.default('ArrayBinding', {
      elements: term.elements.map(t => t == null ? null : this.expand(t)).toArray(),
      restElement: restElement
    });
  }

  expandBindingWithDefault(term) {
    return new _terms2.default('BindingWithDefault', {
      binding: this.expand(term.binding),
      init: this.expand(term.init)
    });
  }

  expandShorthandProperty(term) {
    // because hygiene, shorthand properties must turn into DataProperties
    return new _terms2.default('DataProperty', {
      name: new _terms2.default('StaticPropertyName', {
        value: term.name
      }),
      expression: new _terms2.default('IdentifierExpression', {
        name: term.name
      })
    });
  }

  expandForStatement(term) {
    let init = term.init == null ? null : this.expand(term.init);
    let test = term.test == null ? null : this.expand(term.test);
    let update = term.update == null ? null : this.expand(term.update);
    let body = this.expand(term.body);
    return new _terms2.default('ForStatement', { init: init, test: test, update: update, body: body });
  }

  expandYieldExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new _terms2.default('YieldExpression', {
      expression: expr
    });
  }

  expandYieldGeneratorExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new _terms2.default('YieldGeneratorExpression', {
      expression: expr
    });
  }

  expandWhileStatement(term) {
    return new _terms2.default('WhileStatement', {
      test: this.expand(term.test),
      body: this.expand(term.body)
    });
  }

  expandIfStatement(term) {
    let consequent = term.consequent == null ? null : this.expand(term.consequent);
    let alternate = term.alternate == null ? null : this.expand(term.alternate);
    return new _terms2.default('IfStatement', {
      test: this.expand(term.test),
      consequent: consequent,
      alternate: alternate
    });
  }

  expandBlockStatement(term) {
    return new _terms2.default('BlockStatement', {
      block: this.expand(term.block)
    });
  }

  expandBlock(term) {
    let scope = (0, _scope.freshScope)('block');
    this.context.currentScope.push(scope);
    let compiler = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);

    let markedBody, bodyTerm;
    markedBody = term.statements.map(b => b.addScope(scope, this.context.bindings, _syntax.ALL_PHASES));
    bodyTerm = new _terms2.default('Block', {
      statements: compiler.compile(markedBody)
    });
    this.context.currentScope.pop();
    return bodyTerm;
  }

  expandVariableDeclarationStatement(term) {
    return new _terms2.default('VariableDeclarationStatement', {
      declaration: this.expand(term.declaration)
    });
  }
  expandReturnStatement(term) {
    if (term.expression == null) {
      return term;
    }
    return new _terms2.default("ReturnStatement", {
      expression: this.expand(term.expression)
    });
  }

  expandClassDeclaration(term) {
    return new _terms2.default('ClassDeclaration', {
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray()
    });
  }

  expandClassExpression(term) {
    return new _terms2.default('ClassExpression', {
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray()
    });
  }

  expandClassElement(term) {
    return new _terms2.default('ClassElement', {
      isStatic: term.isStatic,
      method: this.expand(term.method)
    });
  }

  expandThisExpression(term) {
    return term;
  }

  expandSyntaxTemplate(term) {
    let r = (0, _templateProcessor.processTemplate)(term.template.inner());
    let str = _syntax2.default.from("string", _serializer.serializer.write(r.template));
    let callee = new _terms2.default('IdentifierExpression', { name: _syntax2.default.from("identifier", 'syntaxTemplate') });

    let expandedInterps = r.interp.map(i => {
      let enf = new _enforester.Enforester(i, (0, _immutable.List)(), this.context);
      return this.expand(enf.enforest('expression'));
    });

    let args = _immutable.List.of(new _terms2.default('LiteralStringExpression', { value: str })).concat(expandedInterps);

    return new _terms2.default('CallExpression', {
      callee: callee, arguments: args
    });
  }

  expandSyntaxQuote(term) {
    let str = new _terms2.default("LiteralStringExpression", {
      value: _syntax2.default.from("string", _serializer.serializer.write(term.name))
    });

    return new _terms2.default("TemplateExpression", {
      tag: term.template.tag,
      elements: term.template.elements.push(str).push(new _terms2.default('TemplateElement', {
        rawValue: ''
      })).toArray()
    });
  }

  expandStaticMemberExpression(term) {
    return new _terms2.default("StaticMemberExpression", {
      object: this.expand(term.object),
      property: term.property
    });
  }

  expandArrayExpression(term) {
    return new _terms2.default("ArrayExpression", {
      elements: term.elements.map(t => t == null ? t : this.expand(t))
    });
  }

  expandImport(term) {
    return term;
  }

  expandImportNamespace(term) {
    return term;
  }

  expandExport(term) {
    return new _terms2.default('Export', {
      declaration: this.expand(term.declaration)
    });
  }

  expandExportDefault(term) {
    return new _terms2.default('ExportDefault', {
      body: this.expand(term.body)
    });
  }

  expandExportFrom(term) {
    return term;
  }

  expandExportAllFrom(term) {
    return term;
  }

  expandExportSpecifier(term) {
    return term;
  }

  expandStaticPropertyName(term) {
    return term;
  }

  expandDataProperty(term) {
    return new _terms2.default("DataProperty", {
      name: this.expand(term.name),
      expression: this.expand(term.expression)
    });
  }

  expandObjectExpression(term) {
    return new _terms2.default("ObjectExpression", {
      properties: term.properties.map(t => this.expand(t))
    });
  }

  expandVariableDeclarator(term) {
    let init = term.init == null ? null : this.expand(term.init);
    return new _terms2.default("VariableDeclarator", {
      binding: this.expand(term.binding),
      init: init
    });
  }

  expandVariableDeclaration(term) {
    if (term.kind === 'syntax' || term.kind === 'syntaxrec') {
      return term;
    }
    return new _terms2.default("VariableDeclaration", {
      kind: term.kind,
      declarators: term.declarators.map(d => this.expand(d))
    });
  }

  expandParenthesizedExpression(term) {
    if (term.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf = new _enforester.Enforester(term.inner, (0, _immutable.List)(), this.context);
    let lookahead = enf.peek();
    let t = enf.enforestExpression();
    if (t == null || enf.rest.size > 0) {
      throw enf.createError(lookahead, "unexpected syntax");
    }
    return this.expand(t);
  }

  expandUnaryExpression(term) {
    return new _terms2.default('UnaryExpression', {
      operator: term.operator,
      operand: this.expand(term.operand)
    });
  }

  expandUpdateExpression(term) {
    return new _terms2.default('UpdateExpression', {
      isPrefix: term.isPrefix,
      operator: term.operator,
      operand: this.expand(term.operand)
    });
  }

  expandBinaryExpression(term) {
    let left = this.expand(term.left);
    let right = this.expand(term.right);
    return new _terms2.default("BinaryExpression", {
      left: left,
      operator: term.operator,
      right: right
    });
  }

  expandConditionalExpression(term) {
    return new _terms2.default('ConditionalExpression', {
      test: this.expand(term.test),
      consequent: this.expand(term.consequent),
      alternate: this.expand(term.alternate)
    });
  }

  expandNewTargetExpression(term) {
    return term;
  }

  expandNewExpression(term) {
    let callee = this.expand(term.callee);
    let enf = new _enforester.Enforester(term.arguments, (0, _immutable.List)(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new _terms2.default('NewExpression', {
      callee: callee,
      arguments: args.toArray()
    });
  }

  expandSuper(term) {
    return term;
  }

  expandCallExpression(term) {
    let callee = this.expand(term.callee);
    let enf = new _enforester.Enforester(term.arguments, (0, _immutable.List)(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new _terms2.default("CallExpression", {
      callee: callee,
      arguments: args
    });
  }

  expandSpreadElement(term) {
    return new _terms2.default('SpreadElement', {
      expression: this.expand(term.expression)
    });
  }

  expandExpressionStatement(term) {
    let child = this.expand(term.expression);
    return new _terms2.default("ExpressionStatement", {
      expression: child
    });
  }

  expandLabeledStatement(term) {
    return new _terms2.default('LabeledStatement', {
      label: term.label.val(),
      body: this.expand(term.body)
    });
  }

  doFunctionExpansion(term, type) {
    let scope = (0, _scope.freshScope)("fun");
    let red = new _applyScopeInParamsReducer2.default(scope, this.context);
    let params;
    if (type !== 'Getter' && type !== 'Setter') {
      params = red.transform(term.params);
      params = this.expand(params);
    }
    this.context.currentScope.push(scope);
    let compiler = new _compiler2.default(this.context.phase, this.context.env, this.context.store, this.context);

    let markedBody, bodyTerm;
    if (term.body instanceof _terms2.default) {
      // Arrow functions have a single term as their body
      bodyTerm = this.expand(term.body.addScope(scope, this.context.bindings, _syntax.ALL_PHASES));
    } else {
      markedBody = term.body.map(b => b.addScope(scope, this.context.bindings, _syntax.ALL_PHASES));
      bodyTerm = new _terms2.default("FunctionBody", {
        directives: (0, _immutable.List)(),
        statements: compiler.compile(markedBody)
      });
    }
    this.context.currentScope.pop();

    if (type === 'Getter') {
      return new _terms2.default(type, {
        name: this.expand(term.name),
        body: bodyTerm
      });
    } else if (type === 'Setter') {
      return new _terms2.default(type, {
        name: this.expand(term.name),
        param: term.param,
        body: bodyTerm
      });
    } else if (type === 'ArrowExpression') {
      return new _terms2.default(type, {
        params: params,
        body: bodyTerm
      });
    }
    return new _terms2.default(type, {
      name: term.name,
      isGenerator: term.isGenerator,
      params: params,
      body: bodyTerm
    });
  }

  expandMethod(term) {
    return this.doFunctionExpansion(term, 'Method');
  }

  expandSetter(term) {
    return this.doFunctionExpansion(term, 'Setter');
  }

  expandGetter(term) {
    return this.doFunctionExpansion(term, 'Getter');
  }

  expandFunctionDeclaration(term) {
    return this.doFunctionExpansion(term, "FunctionDeclaration");
  }

  expandFunctionExpression(term) {
    return this.doFunctionExpansion(term, "FunctionExpression");
  }

  expandCompoundAssignmentExpression(term) {
    return new _terms2.default("CompoundAssignmentExpression", {
      binding: this.expand(term.binding),
      operator: term.operator,
      expression: this.expand(term.expression)
    });
  }

  expandAssignmentExpression(term) {
    return new _terms2.default("AssignmentExpression", {
      binding: this.expand(term.binding),
      expression: this.expand(term.expression)
    });
  }

  expandEmptyStatement(term) {
    return term;
  }

  expandLiteralBooleanExpression(term) {
    return term;
  }

  expandLiteralNumericExpression(term) {
    return term;
  }
  expandLiteralInfinityExpression(term) {
    return term;
  }

  expandIdentifierExpression(term) {
    let trans = this.context.env.get(term.name.resolve(this.context.phase));
    if (trans) {
      return new _terms2.default("IdentifierExpression", {
        name: trans.id
      });
    }
    return term;
  }

  expandLiteralNullExpression(term) {
    return term;
  }

  expandLiteralStringExpression(term) {
    return term;
  }

  expandLiteralRegExpExpression(term) {
    return term;
  }
}
exports.default = TermExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXJtLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVlLE1BQU0sWUFBTixpQ0FBeUM7QUFDdEQsY0FBWSxPQUFaLEVBQXFCO0FBQ25CLFVBQU0sUUFBTixFQUFnQixJQUFoQjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDRDs7QUFFRCxTQUFPLElBQVAsRUFBYTtBQUNYLFdBQU8sS0FBSyxRQUFMLENBQWMsSUFBZCxDQUFQO0FBQ0Q7O0FBRUQsZUFBYSxJQUFiLEVBQW1CO0FBQ2pCLFdBQU8sSUFBUDtBQUNEOztBQUVELDJCQUF5QixJQUF6QixFQUErQjtBQUM3QixXQUFPLG9CQUFTLG9CQUFULEVBQStCO0FBQ3BDLFdBQUssS0FBSyxHQUFMLElBQVksSUFBWixHQUFtQixJQUFuQixHQUEwQixLQUFLLE1BQUwsQ0FBWSxLQUFLLEdBQWpCLENBREs7QUFFcEMsZ0JBQVUsS0FBSyxRQUFMLENBQWMsT0FBZDtBQUYwQixLQUEvQixDQUFQO0FBSUQ7O0FBRUQsdUJBQXFCLElBQXJCLEVBQTJCO0FBQ3pCLFdBQU8sb0JBQVMsZ0JBQVQsRUFBMkI7QUFDaEMsYUFBTyxLQUFLLEtBQUwsR0FBYSxLQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWIsR0FBZ0M7QUFEUCxLQUEzQixDQUFQO0FBR0Q7O0FBRUQseUJBQXVCLElBQXZCLEVBQTZCO0FBQzNCLFdBQU8sb0JBQVMsa0JBQVQsRUFBNkI7QUFDbEMsWUFBTSxLQUFLLE1BQUwsQ0FBWSxLQUFLLElBQWpCLENBRDRCO0FBRWxDLFlBQU0sS0FBSyxNQUFMLENBQVksS0FBSyxJQUFqQjtBQUY0QixLQUE3QixDQUFQO0FBSUQ7O0FBRUQsc0JBQW9CLElBQXBCLEVBQTBCO0FBQ3hCLFdBQU8sb0JBQVMsZUFBVCxFQUEwQjtBQUMvQixZQUFN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RUQsNkJBQTJCLElBQTNCLEVBQWlDO0FBQy9CLFdBQU8sb0JBQVMsc0JBQVQsRUFBaUM7QUFDdEMsZUFBUyxLQUFLLE1BQUwsQ0FBWSxLQUFLLE9BQWpCLENBRDZCO0FBRXRDLGtCQUFZLEtBQUssTUFBTCxDQUFZLEtBQUssVUFBakI7QUFGMEIsS0FBakMsQ0FBUDtBQUlEOztBQUVELHVCQUFxQixJQUFyQixFQUEyQjtBQUN6QixXQUFPLElBQVA7QUFDRDs7QUFFRCxpQ0FBK0IsSUFBL0IsRUFBcUM7QUFDbkMsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsaUNBQStCLElBQS9CLEVBQXFDO0FBQ25DLFdBQU8sSUFBUDtBQUNEO0FBQ0Qsa0NBQWdDLElBQWhDLEVBQXNDO0FBQ3BDLFdBQU8sSUFBUDtBQUNEOztBQUVELDZCQUEyQixJQUEzQixFQUFpQztBQUMvQixRQUFJLFFBQVEsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixLQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLEtBQUssT0FBTCxDQUFhLEtBQS9CLENBQXJCLENBQVo7QUFDQSxRQUFJLEtBQUosRUFBVztBQUNULGFBQU8sb0JBQVMsc0JBQVQsRUFBaUM7QUFDdEMsY0FBTSxNQUFNO0FBRDBCLE9BQWpDLENBQVA7QUFHRDtBQUNELFdBQU8sSUFBUDtBQUNEOztBQUVELDhCQUE0QixJQUE1QixFQUFrQztBQUNoQyxXQUFPLElBQVA7QUFDRDs7QUFFRCxnQ0FBOEIsSUFBOUIsRUFBb0M7QUFDbEMsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsZ0NBQThCLElBQTlCLEVBQW9DO0FBQ2xDLFdBQU8sSUFBUDtBQUNEO0FBMW1CcUQ7a0JBQW5DLFkiLCJmaWxlIjoidGVybS1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpc3QgfSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7IGZyZXNoU2NvcGUgfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIgZnJvbSBcIi4vYXBwbHktc2NvcGUtaW4tcGFyYW1zLXJlZHVjZXJcIjtcbmltcG9ydCBDb21waWxlciBmcm9tICcuL2NvbXBpbGVyJztcbmltcG9ydCBTeW50YXgsIHsgQUxMX1BIQVNFUyB9IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHsgc2VyaWFsaXplciB9IGZyb20gXCIuL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7IEVuZm9yZXN0ZXIgfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgeyBwcm9jZXNzVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgQVNURGlzcGF0Y2hlciBmcm9tICcuL2FzdC1kaXNwYXRjaGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVybUV4cGFuZGVyIGV4dGVuZHMgQVNURGlzcGF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHQpIHtcbiAgICBzdXBlcignZXhwYW5kJywgdHJ1ZSk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuXG4gIGV4cGFuZCh0ZXJtKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2godGVybSk7XG4gIH1cblxuICBleHBhbmRQcmFnbWEodGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kVGVtcGxhdGVFeHByZXNzaW9uKHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1RlbXBsYXRlRXhwcmVzc2lvbicsIHtcbiAgICAgIHRhZzogdGVybS50YWcgPT0gbnVsbCA/IG51bGwgOiB0aGlzLmV4cGFuZCh0ZXJtLnRhZyksXG4gICAgICBlbGVtZW50czogdGVybS5lbGVtZW50cy50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEJyZWFrU3RhdGVtZW50KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0JyZWFrU3RhdGVtZW50Jywge1xuICAgICAgbGFiZWw6IHRlcm0ubGFiZWwgPyB0ZXJtLmxhYmVsLnZhbCgpIDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kRG9XaGlsZVN0YXRlbWVudCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdEb1doaWxlU3RhdGVtZW50Jywge1xuICAgICAgYm9keTogdGhpcy5leHBhbmQodGVybS5ib2R5KSxcbiAgICAgIHRlc3Q6IHRoaXMuZXhwYW5kKHRlcm0udGVzdClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFdpdGhTdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnV2l0aFN0YXRlbWVudCcsIHtcbiAgICAgIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm0uYm9keSksXG4gICAgICBvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm0ub2JqZWN0KVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kRGVidWdnZXJTdGF0ZW1lbnQodGVybSkgeyByZXR1cm4gdGVybTt9XG5cbiAgZXhwYW5kQ29udGludWVTdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQ29udGludWVTdGF0ZW1lbnQnLCB7XG4gICAgICBsYWJlbDogdGVybS5sYWJlbCA/IHRlcm0ubGFiZWwudmFsKCkgOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdCcsIHtcbiAgICAgIGRpc2NyaW1pbmFudDogdGhpcy5leHBhbmQodGVybS5kaXNjcmltaW5hbnQpLFxuICAgICAgcHJlRGVmYXVsdENhc2VzOiB0ZXJtLnByZURlZmF1bHRDYXNlcy5tYXAoYyA9PiB0aGlzLmV4cGFuZChjKSkudG9BcnJheSgpLFxuICAgICAgZGVmYXVsdENhc2U6IHRoaXMuZXhwYW5kKHRlcm0uZGVmYXVsdENhc2UpLFxuICAgICAgcG9zdERlZmF1bHRDYXNlczogdGVybS5wb3N0RGVmYXVsdENhc2VzLm1hcChjID0+IHRoaXMuZXhwYW5kKGMpKS50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdDb21wdXRlZE1lbWJlckV4cHJlc3Npb24nLCB7XG4gICAgICBvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm0ub2JqZWN0KSxcbiAgICAgIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm0uZXhwcmVzc2lvbilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFN3aXRjaFN0YXRlbWVudCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdTd2l0Y2hTdGF0ZW1lbnQnLCB7XG4gICAgICBkaXNjcmltaW5hbnQ6IHRoaXMuZXhwYW5kKHRlcm0uZGlzY3JpbWluYW50KSxcbiAgICAgIGNhc2VzOiB0ZXJtLmNhc2VzLm1hcChjID0+IHRoaXMuZXhwYW5kKGMpKS50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEZvcm1hbFBhcmFtZXRlcnModGVybSkge1xuICAgIGxldCByZXN0ID0gdGVybS5yZXN0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5yZXN0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0Zvcm1hbFBhcmFtZXRlcnMnLCB7XG4gICAgICBpdGVtczogdGVybS5pdGVtcy5tYXAoaSA9PiB0aGlzLmV4cGFuZChpKSksXG4gICAgICByZXN0XG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRBcnJvd0V4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybSwgJ0Fycm93RXhwcmVzc2lvbicpO1xuICB9XG5cbiAgZXhwYW5kU3dpdGNoRGVmYXVsdCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdTd2l0Y2hEZWZhdWx0Jywge1xuICAgICAgY29uc2VxdWVudDogdGVybS5jb25zZXF1ZW50Lm1hcChjID0+IHRoaXMuZXhwYW5kKGMpKS50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFN3aXRjaENhc2UodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnU3dpdGNoQ2FzZScsIHtcbiAgICAgIHRlc3Q6IHRoaXMuZXhwYW5kKHRlcm0udGVzdCksXG4gICAgICBjb25zZXF1ZW50OiB0ZXJtLmNvbnNlcXVlbnQubWFwKGMgPT4gdGhpcy5leHBhbmQoYykpLnRvQXJyYXkoKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kRm9ySW5TdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnRm9ySW5TdGF0ZW1lbnQnLCB7XG4gICAgICBsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtLmxlZnQpLFxuICAgICAgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm0ucmlnaHQpLFxuICAgICAgYm9keTogdGhpcy5leHBhbmQodGVybS5ib2R5KVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kVHJ5Q2F0Y2hTdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnVHJ5Q2F0Y2hTdGF0ZW1lbnQnLCB7XG4gICAgICBib2R5OiB0aGlzLmV4cGFuZCh0ZXJtLmJvZHkpLFxuICAgICAgY2F0Y2hDbGF1c2U6IHRoaXMuZXhwYW5kKHRlcm0uY2F0Y2hDbGF1c2UpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRUcnlGaW5hbGx5U3RhdGVtZW50KHRlcm0pIHtcbiAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0ZXJtLmNhdGNoQ2xhdXNlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5jYXRjaENsYXVzZSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdUcnlGaW5hbGx5U3RhdGVtZW50Jywge1xuICAgICAgYm9keTogdGhpcy5leHBhbmQodGVybS5ib2R5KSxcbiAgICAgIGNhdGNoQ2xhdXNlLFxuICAgICAgZmluYWxpemVyOiB0aGlzLmV4cGFuZCh0ZXJtLmZpbmFsaXplcilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZENhdGNoQ2xhdXNlKHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0NhdGNoQ2xhdXNlJywge1xuICAgICAgYmluZGluZzogdGhpcy5leHBhbmQodGVybS5iaW5kaW5nKSxcbiAgICAgIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm0uYm9keSlcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFRocm93U3RhdGVtZW50KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1Rocm93U3RhdGVtZW50Jywge1xuICAgICAgZXhwcmVzc2lvbjogdGhpcy5leHBhbmQodGVybS5leHByZXNzaW9uKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kRm9yT2ZTdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnRm9yT2ZTdGF0ZW1lbnQnLCB7XG4gICAgICBsZWZ0OiB0aGlzLmV4cGFuZCh0ZXJtLmxlZnQpLFxuICAgICAgcmlnaHQ6IHRoaXMuZXhwYW5kKHRlcm0ucmlnaHQpLFxuICAgICAgYm9keTogdGhpcy5leHBhbmQodGVybS5ib2R5KVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQmluZGluZ0lkZW50aWZpZXIodGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcih0ZXJtKSB7XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cbiAgZXhwYW5kQmluZGluZ1Byb3BlcnR5UHJvcGVydHkodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQmluZGluZ1Byb3BlcnR5UHJvcGVydHknLCB7XG4gICAgICBuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtLm5hbWUpLFxuICAgICAgYmluZGluZzogdGhpcy5leHBhbmQodGVybS5iaW5kaW5nKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQ29tcHV0ZWRQcm9wZXJ0eU5hbWUodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQ29tcHV0ZWRQcm9wZXJ0eU5hbWUnLCB7XG4gICAgICBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtLmV4cHJlc3Npb24pXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRPYmplY3RCaW5kaW5nKHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ09iamVjdEJpbmRpbmcnLCB7XG4gICAgICBwcm9wZXJ0aWVzOiB0ZXJtLnByb3BlcnRpZXMubWFwKHQgPT4gdGhpcy5leHBhbmQodCkpLnRvQXJyYXkoKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQXJyYXlCaW5kaW5nKHRlcm0pIHtcbiAgICBsZXQgcmVzdEVsZW1lbnQgPSB0ZXJtLnJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5yZXN0RWxlbWVudCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdBcnJheUJpbmRpbmcnLCB7XG4gICAgICBlbGVtZW50czogdGVybS5lbGVtZW50cy5tYXAodCA9PiB0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodCkpLnRvQXJyYXkoKSxcbiAgICAgIHJlc3RFbGVtZW50XG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRCaW5kaW5nV2l0aERlZmF1bHQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQmluZGluZ1dpdGhEZWZhdWx0Jywge1xuICAgICAgYmluZGluZzogdGhpcy5leHBhbmQodGVybS5iaW5kaW5nKSxcbiAgICAgIGluaXQ6IHRoaXMuZXhwYW5kKHRlcm0uaW5pdClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFNob3J0aGFuZFByb3BlcnR5KHRlcm0pIHtcbiAgICAvLyBiZWNhdXNlIGh5Z2llbmUsIHNob3J0aGFuZCBwcm9wZXJ0aWVzIG11c3QgdHVybiBpbnRvIERhdGFQcm9wZXJ0aWVzXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdEYXRhUHJvcGVydHknLCB7XG4gICAgICBuYW1lOiBuZXcgVGVybSgnU3RhdGljUHJvcGVydHlOYW1lJywge1xuICAgICAgICB2YWx1ZTogdGVybS5uYW1lXG4gICAgICB9KSxcbiAgICAgIGV4cHJlc3Npb246IG5ldyBUZXJtKCdJZGVudGlmaWVyRXhwcmVzc2lvbicsIHtcbiAgICAgICAgbmFtZTogdGVybS5uYW1lXG4gICAgICB9KVxuICAgIH0pO1xuICB9XG5cblxuICBleHBhbmRGb3JTdGF0ZW1lbnQodGVybSkge1xuICAgIGxldCBpbml0ID0gdGVybS5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5pbml0KTtcbiAgICBsZXQgdGVzdCA9IHRlcm0udGVzdCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm0udGVzdCk7XG4gICAgbGV0IHVwZGF0ZSA9IHRlcm0udXBkYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS51cGRhdGUpO1xuICAgIGxldCBib2R5ID0gdGhpcy5leHBhbmQodGVybS5ib2R5KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0ZvclN0YXRlbWVudCcsIHsgaW5pdCwgdGVzdCwgdXBkYXRlLCBib2R5IH0pO1xuICB9XG5cbiAgZXhwYW5kWWllbGRFeHByZXNzaW9uKHRlcm0pIHtcbiAgICBsZXQgZXhwciA9IHRlcm0uZXhwcmVzc2lvbiA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm0uZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdZaWVsZEV4cHJlc3Npb24nLCB7XG4gICAgICBleHByZXNzaW9uOiBleHByXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24odGVybSkge1xuICAgIGxldCBleHByID0gdGVybS5leHByZXNzaW9uID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5leHByZXNzaW9uKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1lpZWxkR2VuZXJhdG9yRXhwcmVzc2lvbicsIHtcbiAgICAgIGV4cHJlc3Npb246IGV4cHJcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFdoaWxlU3RhdGVtZW50KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1doaWxlU3RhdGVtZW50Jywge1xuICAgICAgdGVzdDogdGhpcy5leHBhbmQodGVybS50ZXN0KSxcbiAgICAgIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm0uYm9keSlcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZElmU3RhdGVtZW50KHRlcm0pIHtcbiAgICBsZXQgY29uc2VxdWVudCA9IHRlcm0uY29uc2VxdWVudCA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm0uY29uc2VxdWVudCk7XG4gICAgbGV0IGFsdGVybmF0ZSA9IHRlcm0uYWx0ZXJuYXRlID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5hbHRlcm5hdGUpO1xuICAgIHJldHVybiBuZXcgVGVybSgnSWZTdGF0ZW1lbnQnLCB7XG4gICAgICB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtLnRlc3QpLFxuICAgICAgY29uc2VxdWVudDogY29uc2VxdWVudCxcbiAgICAgIGFsdGVybmF0ZTogYWx0ZXJuYXRlXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRCbG9ja1N0YXRlbWVudCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdCbG9ja1N0YXRlbWVudCcsIHtcbiAgICAgIGJsb2NrOiB0aGlzLmV4cGFuZCh0ZXJtLmJsb2NrKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQmxvY2sodGVybSkge1xuICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoJ2Jsb2NrJyk7XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlKTtcbiAgICBsZXQgY29tcGlsZXIgPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG5cbiAgICBsZXQgbWFya2VkQm9keSwgYm9keVRlcm07XG4gICAgbWFya2VkQm9keSA9IHRlcm0uc3RhdGVtZW50cy5tYXAoYiA9PiBiLmFkZFNjb3BlKHNjb3BlLCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIEFMTF9QSEFTRVMpKTtcbiAgICBib2R5VGVybSA9IG5ldyBUZXJtKCdCbG9jaycsIHtcbiAgICAgIHN0YXRlbWVudHM6IGNvbXBpbGVyLmNvbXBpbGUobWFya2VkQm9keSlcbiAgICB9KTtcbiAgICB0aGlzLmNvbnRleHQuY3VycmVudFNjb3BlLnBvcCgpO1xuICAgIHJldHVybiBib2R5VGVybTtcbiAgfVxuXG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCcsIHtcbiAgICAgIGRlY2xhcmF0aW9uOiB0aGlzLmV4cGFuZCh0ZXJtLmRlY2xhcmF0aW9uKVxuICAgIH0pO1xuICB9XG4gIGV4cGFuZFJldHVyblN0YXRlbWVudCh0ZXJtKSB7XG4gICAgaWYgKHRlcm0uZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtcbiAgICAgIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm0uZXhwcmVzc2lvbilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZENsYXNzRGVjbGFyYXRpb24odGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQ2xhc3NEZWNsYXJhdGlvbicsIHtcbiAgICAgIG5hbWU6IHRlcm0ubmFtZSA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm0ubmFtZSksXG4gICAgICBzdXBlcjogdGVybS5zdXBlciA9PSBudWxsID8gbnVsbCA6IHRoaXMuZXhwYW5kKHRlcm0uc3VwZXIpLFxuICAgICAgZWxlbWVudHM6IHRlcm0uZWxlbWVudHMubWFwKGVsID0+IHRoaXMuZXhwYW5kKGVsKSkudG9BcnJheSgpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRDbGFzc0V4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnQ2xhc3NFeHByZXNzaW9uJywge1xuICAgICAgbmFtZTogdGVybS5uYW1lID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5uYW1lKSxcbiAgICAgIHN1cGVyOiB0ZXJtLnN1cGVyID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5zdXBlciksXG4gICAgICBlbGVtZW50czogdGVybS5lbGVtZW50cy5tYXAoZWwgPT4gdGhpcy5leHBhbmQoZWwpKS50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZENsYXNzRWxlbWVudCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdDbGFzc0VsZW1lbnQnLCB7XG4gICAgICBpc1N0YXRpYzogdGVybS5pc1N0YXRpYyxcbiAgICAgIG1ldGhvZDogdGhpcy5leHBhbmQodGVybS5tZXRob2QpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRUaGlzRXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cblxuICBleHBhbmRTeW50YXhUZW1wbGF0ZSh0ZXJtKSB7XG4gICAgbGV0IHIgPSBwcm9jZXNzVGVtcGxhdGUodGVybS50ZW1wbGF0ZS5pbm5lcigpKTtcbiAgICBsZXQgc3RyID0gU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgc2VyaWFsaXplci53cml0ZShyLnRlbXBsYXRlKSk7XG4gICAgbGV0IGNhbGxlZSA9IG5ldyBUZXJtKCdJZGVudGlmaWVyRXhwcmVzc2lvbicsIHsgbmFtZTogU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsICdzeW50YXhUZW1wbGF0ZScpIH0pO1xuXG4gICAgbGV0IGV4cGFuZGVkSW50ZXJwcyA9IHIuaW50ZXJwLm1hcChpID0+IHtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmQoZW5mLmVuZm9yZXN0KCdleHByZXNzaW9uJykpO1xuICAgIH0pO1xuXG4gICAgbGV0IGFyZ3MgPSBMaXN0Lm9mKG5ldyBUZXJtKCdMaXRlcmFsU3RyaW5nRXhwcmVzc2lvbicsIHt2YWx1ZTogc3RyIH0pKVxuICAgICAgICAgICAgICAgICAgIC5jb25jYXQoZXhwYW5kZWRJbnRlcnBzKTtcblxuICAgIHJldHVybiBuZXcgVGVybSgnQ2FsbEV4cHJlc3Npb24nLCB7XG4gICAgICBjYWxsZWUsIGFyZ3VtZW50czogYXJnc1xuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kU3ludGF4UXVvdGUodGVybSkge1xuICAgIGxldCBzdHIgPSBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHtcbiAgICAgIHZhbHVlOiBTeW50YXguZnJvbShcInN0cmluZ1wiLCBzZXJpYWxpemVyLndyaXRlKHRlcm0ubmFtZSkpXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge1xuICAgICAgdGFnOiB0ZXJtLnRlbXBsYXRlLnRhZyxcbiAgICAgIGVsZW1lbnRzOiB0ZXJtLnRlbXBsYXRlLmVsZW1lbnRzLnB1c2goc3RyKS5wdXNoKG5ldyBUZXJtKCdUZW1wbGF0ZUVsZW1lbnQnLCB7XG4gICAgICAgIHJhd1ZhbHVlOiAnJ1xuICAgICAgfSkpLnRvQXJyYXkoKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7XG4gICAgICBvYmplY3Q6IHRoaXMuZXhwYW5kKHRlcm0ub2JqZWN0KSxcbiAgICAgIHByb3BlcnR5OiB0ZXJtLnByb3BlcnR5XG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRBcnJheUV4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7XG4gICAgICBlbGVtZW50czogdGVybS5lbGVtZW50cy5tYXAodCA9PiB0ID09IG51bGwgPyB0IDogdGhpcy5leHBhbmQodCkpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRJbXBvcnQodGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kSW1wb3J0TmFtZXNwYWNlKHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxuXG4gIGV4cGFuZEV4cG9ydCh0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnQnLCB7XG4gICAgICBkZWNsYXJhdGlvbjogdGhpcy5leHBhbmQodGVybS5kZWNsYXJhdGlvbilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEV4cG9ydERlZmF1bHQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0RGVmYXVsdCcsIHtcbiAgICAgIGJvZHk6IHRoaXMuZXhwYW5kKHRlcm0uYm9keSlcbiAgICB9KTtcbiAgfVxuXG5cbiAgZXhwYW5kRXhwb3J0RnJvbSh0ZXJtKSB7XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cblxuICBleHBhbmRFeHBvcnRBbGxGcm9tKHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxuXG4gIGV4cGFuZEV4cG9ydFNwZWNpZmllcih0ZXJtKSB7XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cblxuICBleHBhbmRTdGF0aWNQcm9wZXJ0eU5hbWUodGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kRGF0YVByb3BlcnR5KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge1xuICAgICAgbmFtZTogdGhpcy5leHBhbmQodGVybS5uYW1lKSxcbiAgICAgIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm0uZXhwcmVzc2lvbilcbiAgICB9KTtcbiAgfVxuXG5cbiAgZXhwYW5kT2JqZWN0RXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7XG4gICAgICBwcm9wZXJ0aWVzOiB0ZXJtLnByb3BlcnRpZXMubWFwKHQgPT4gdGhpcy5leHBhbmQodCkpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRWYXJpYWJsZURlY2xhcmF0b3IodGVybSkge1xuICAgIGxldCBpbml0ID0gdGVybS5pbml0ID09IG51bGwgPyBudWxsIDogdGhpcy5leHBhbmQodGVybS5pbml0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge1xuICAgICAgYmluZGluZzogdGhpcy5leHBhbmQodGVybS5iaW5kaW5nKSxcbiAgICAgIGluaXQ6IGluaXRcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFZhcmlhYmxlRGVjbGFyYXRpb24odGVybSkge1xuICAgIGlmICh0ZXJtLmtpbmQgPT09ICdzeW50YXgnIHx8IHRlcm0ua2luZCA9PT0gJ3N5bnRheHJlYycpIHtcbiAgICAgIHJldHVybiB0ZXJtO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtcbiAgICAgIGtpbmQ6IHRlcm0ua2luZCxcbiAgICAgIGRlY2xhcmF0b3JzOiB0ZXJtLmRlY2xhcmF0b3JzLm1hcChkID0+IHRoaXMuZXhwYW5kKGQpKVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kUGFyZW50aGVzaXplZEV4cHJlc3Npb24odGVybSkge1xuICAgIGlmICh0ZXJtLmlubmVyLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIpO1xuICAgIH1cbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGVybS5pbm5lciwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWQgPSBlbmYucGVlaygpO1xuICAgIGxldCB0ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ID09IG51bGwgfHwgZW5mLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIHRocm93IGVuZi5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4cGFuZCh0KTtcbiAgfVxuXG4gIGV4cGFuZFVuYXJ5RXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdVbmFyeUV4cHJlc3Npb24nLCB7XG4gICAgICBvcGVyYXRvcjogdGVybS5vcGVyYXRvcixcbiAgICAgIG9wZXJhbmQ6IHRoaXMuZXhwYW5kKHRlcm0ub3BlcmFuZClcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZFVwZGF0ZUV4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnVXBkYXRlRXhwcmVzc2lvbicsIHtcbiAgICAgIGlzUHJlZml4OiB0ZXJtLmlzUHJlZml4LFxuICAgICAgb3BlcmF0b3I6IHRlcm0ub3BlcmF0b3IsXG4gICAgICBvcGVyYW5kOiB0aGlzLmV4cGFuZCh0ZXJtLm9wZXJhbmQpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRCaW5hcnlFeHByZXNzaW9uKHRlcm0pIHtcbiAgICBsZXQgbGVmdCA9IHRoaXMuZXhwYW5kKHRlcm0ubGVmdCk7XG4gICAgbGV0IHJpZ2h0ID0gdGhpcy5leHBhbmQodGVybS5yaWdodCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7XG4gICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgb3BlcmF0b3I6IHRlcm0ub3BlcmF0b3IsXG4gICAgICByaWdodDogcmlnaHRcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdDb25kaXRpb25hbEV4cHJlc3Npb24nLCB7XG4gICAgICB0ZXN0OiB0aGlzLmV4cGFuZCh0ZXJtLnRlc3QpLFxuICAgICAgY29uc2VxdWVudDogdGhpcy5leHBhbmQodGVybS5jb25zZXF1ZW50KSxcbiAgICAgIGFsdGVybmF0ZTogdGhpcy5leHBhbmQodGVybS5hbHRlcm5hdGUpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmROZXdUYXJnZXRFeHByZXNzaW9uKHRlcm0pIHsgcmV0dXJuIHRlcm07IH1cblxuICBleHBhbmROZXdFeHByZXNzaW9uKHRlcm0pIHtcbiAgICBsZXQgY2FsbGVlID0gdGhpcy5leHBhbmQodGVybS5jYWxsZWUpO1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0ZXJtLmFyZ3VtZW50cywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhcmdzID0gZW5mLmVuZm9yZXN0QXJndW1lbnRMaXN0KCkubWFwKGFyZyA9PiB0aGlzLmV4cGFuZChhcmcpKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ05ld0V4cHJlc3Npb24nLCB7XG4gICAgICBjYWxsZWUsXG4gICAgICBhcmd1bWVudHM6IGFyZ3MudG9BcnJheSgpXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRTdXBlcih0ZXJtKSB7IHJldHVybiB0ZXJtOyB9XG5cbiAgZXhwYW5kQ2FsbEV4cHJlc3Npb24odGVybSkge1xuICAgIGxldCBjYWxsZWUgPSB0aGlzLmV4cGFuZCh0ZXJtLmNhbGxlZSk7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRlcm0uYXJndW1lbnRzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFyZ3MgPSBlbmYuZW5mb3Jlc3RBcmd1bWVudExpc3QoKS5tYXAoYXJnID0+IHRoaXMuZXhwYW5kKGFyZykpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtcbiAgICAgIGNhbGxlZTogY2FsbGVlLFxuICAgICAgYXJndW1lbnRzOiBhcmdzXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRTcHJlYWRFbGVtZW50KHRlcm0pIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1NwcmVhZEVsZW1lbnQnLCB7XG4gICAgICBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtLmV4cHJlc3Npb24pXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRFeHByZXNzaW9uU3RhdGVtZW50KHRlcm0pIHtcbiAgICBsZXQgY2hpbGQgPSB0aGlzLmV4cGFuZCh0ZXJtLmV4cHJlc3Npb24pO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge1xuICAgICAgZXhwcmVzc2lvbjogY2hpbGRcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZExhYmVsZWRTdGF0ZW1lbnQodGVybSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnTGFiZWxlZFN0YXRlbWVudCcsIHtcbiAgICAgIGxhYmVsOiB0ZXJtLmxhYmVsLnZhbCgpLFxuICAgICAgYm9keTogdGhpcy5leHBhbmQodGVybS5ib2R5KVxuICAgIH0pO1xuICB9XG5cbiAgZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtLCB0eXBlKSB7XG4gICAgbGV0IHNjb3BlID0gZnJlc2hTY29wZShcImZ1blwiKTtcbiAgICBsZXQgcmVkID0gbmV3IEFwcGx5U2NvcGVJblBhcmFtc1JlZHVjZXIoc2NvcGUsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHBhcmFtcztcbiAgICBpZiAodHlwZSAhPT0gJ0dldHRlcicgJiYgdHlwZSAhPT0gJ1NldHRlcicpIHtcbiAgICAgIHBhcmFtcyA9IHJlZC50cmFuc2Zvcm0odGVybS5wYXJhbXMpO1xuICAgICAgcGFyYW1zID0gdGhpcy5leHBhbmQocGFyYW1zKTtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0LmN1cnJlbnRTY29wZS5wdXNoKHNjb3BlKTtcbiAgICBsZXQgY29tcGlsZXIgPSBuZXcgQ29tcGlsZXIodGhpcy5jb250ZXh0LnBoYXNlLCB0aGlzLmNvbnRleHQuZW52LCB0aGlzLmNvbnRleHQuc3RvcmUsIHRoaXMuY29udGV4dCk7XG5cbiAgICBsZXQgbWFya2VkQm9keSwgYm9keVRlcm07XG4gICAgaWYgKHRlcm0uYm9keSBpbnN0YW5jZW9mIFRlcm0pIHtcbiAgICAgIC8vIEFycm93IGZ1bmN0aW9ucyBoYXZlIGEgc2luZ2xlIHRlcm0gYXMgdGhlaXIgYm9keVxuICAgICAgYm9keVRlcm0gPSB0aGlzLmV4cGFuZCh0ZXJtLmJvZHkuYWRkU2NvcGUoc2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZWRCb2R5ID0gdGVybS5ib2R5Lm1hcChiID0+IGIuYWRkU2NvcGUoc2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykpO1xuICAgICAgYm9keVRlcm0gPSBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7XG4gICAgICAgIGRpcmVjdGl2ZXM6IExpc3QoKSxcbiAgICAgICAgc3RhdGVtZW50czogY29tcGlsZXIuY29tcGlsZShtYXJrZWRCb2R5KVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dC5jdXJyZW50U2NvcGUucG9wKCk7XG5cbiAgICBpZiAodHlwZSA9PT0gJ0dldHRlcicpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlLCB7XG4gICAgICAgIG5hbWU6IHRoaXMuZXhwYW5kKHRlcm0ubmFtZSksXG4gICAgICAgIGJvZHk6IGJvZHlUZXJtXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdTZXR0ZXInKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge1xuICAgICAgICBuYW1lOiB0aGlzLmV4cGFuZCh0ZXJtLm5hbWUpLFxuICAgICAgICBwYXJhbTogdGVybS5wYXJhbSxcbiAgICAgICAgYm9keTogYm9keVRlcm1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0Fycm93RXhwcmVzc2lvbicpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlLCB7XG4gICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICBib2R5OiBib2R5VGVybVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlLCB7XG4gICAgICBuYW1lOiB0ZXJtLm5hbWUsXG4gICAgICBpc0dlbmVyYXRvcjogdGVybS5pc0dlbmVyYXRvcixcbiAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgYm9keTogYm9keVRlcm1cbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZE1ldGhvZCh0ZXJtKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9GdW5jdGlvbkV4cGFuc2lvbih0ZXJtLCAnTWV0aG9kJyk7XG4gIH1cblxuICBleHBhbmRTZXR0ZXIodGVybSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybSwgJ1NldHRlcicpO1xuICB9XG5cbiAgZXhwYW5kR2V0dGVyKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm0sICdHZXR0ZXInKTtcbiAgfVxuXG4gIGV4cGFuZEZ1bmN0aW9uRGVjbGFyYXRpb24odGVybSkge1xuICAgIHJldHVybiB0aGlzLmRvRnVuY3Rpb25FeHBhbnNpb24odGVybSwgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIpO1xuICB9XG5cbiAgZXhwYW5kRnVuY3Rpb25FeHByZXNzaW9uKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5kb0Z1bmN0aW9uRXhwYW5zaW9uKHRlcm0sIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpO1xuICB9XG5cbiAgZXhwYW5kQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7XG4gICAgICBiaW5kaW5nOiB0aGlzLmV4cGFuZCh0ZXJtLmJpbmRpbmcpLFxuICAgICAgb3BlcmF0b3I6IHRlcm0ub3BlcmF0b3IsXG4gICAgICBleHByZXNzaW9uOiB0aGlzLmV4cGFuZCh0ZXJtLmV4cHJlc3Npb24pXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRBc3NpZ25tZW50RXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge1xuICAgICAgYmluZGluZzogdGhpcy5leHBhbmQodGVybS5iaW5kaW5nKSxcbiAgICAgIGV4cHJlc3Npb246IHRoaXMuZXhwYW5kKHRlcm0uZXhwcmVzc2lvbilcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEVtcHR5U3RhdGVtZW50KHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxuXG4gIGV4cGFuZExpdGVyYWxCb29sZWFuRXhwcmVzc2lvbih0ZXJtKSB7XG4gICAgcmV0dXJuIHRlcm07XG4gIH1cblxuICBleHBhbmRMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG4gIGV4cGFuZExpdGVyYWxJbmZpbml0eUV4cHJlc3Npb24odGVybSkge1xuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kSWRlbnRpZmllckV4cHJlc3Npb24odGVybSkge1xuICAgIGxldCB0cmFucyA9IHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm0ubmFtZS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICAgIGlmICh0cmFucykge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge1xuICAgICAgICBuYW1lOiB0cmFucy5pZFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXJtO1xuICB9XG5cbiAgZXhwYW5kTGl0ZXJhbE51bGxFeHByZXNzaW9uKHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxuXG4gIGV4cGFuZExpdGVyYWxTdHJpbmdFeHByZXNzaW9uKHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxuXG4gIGV4cGFuZExpdGVyYWxSZWdFeHBFeHByZXNzaW9uKHRlcm0pIHtcbiAgICByZXR1cm4gdGVybTtcbiAgfVxufVxuIl19