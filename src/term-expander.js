import { List } from 'immutable';
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import { Scope, freshScope } from "./scope";
import ApplyScopeInParamsReducer from "./apply-scope-in-params-reducer";
import reducer, { MonoidalReducer } from "shift-reducer";
import Expander from './expander';
import Syntax from "./syntax";
import { serializer, makeDeserializer } from "./serializer";
import { enforestExpr, Enforester } from "./enforester";
import { assert } from './errors';
import { processTemplate }from './template-processor.js';

export default class TermExpander {
  constructor(context) {
    this.context = context;
  }

  expand(term) {
    let field = "expand" + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    }
    assert(false, "expand not implemented yet for: " + term.type);
  }

  expandTemplateExpression(term) {
    return new Term('TemplateExpression', {
      tag: term.tag == null ? null : this.expand(term.tag),
      elements: term.elements.toArray()
    });
  }

  expandBreakStatement(term) {
    return new Term('BreakStatement', {
      label: term.label ? term.label.val() : null
    });
  }

  expandDoWhileStatement(term) {
    return new Term('DoWhileStatement', {
      body: this.expand(term.body),
      test: this.expand(term.test)
    });
  }

  expandWithStatement(term) {
    return new Term('WithStatement', {
      body: this.expand(term.body),
      object: this.expand(term.object)
    });
  }

  expandDebuggerStatement(term) { return term;}

  expandContinueStatement(term) {
    return new Term('ContinueStatement', {
      label: term.label ? term.label.val() : null
    });
  }

  expandSwitchStatementWithDefault(term) {
    return new Term('SwitchStatementWithDefault', {
      discriminant: this.expand(term.discriminant),
      preDefaultCases: term.preDefaultCases.map(c => this.expand(c)).toArray(),
      defaultCase: this.expand(term.defaultCase),
      postDefaultCases: term.postDefaultCases.map(c => this.expand(c)).toArray()
    });
  }

  expandComputedMemberExpression(term) {
    return new Term('ComputedMemberExpression', {
      object: this.expand(term.object),
      expression: this.expand(term.expression)
    });
  }

  expandSwitchStatement(term) {
    return new Term('SwitchStatement', {
      discriminant: this.expand(term.discriminant),
      cases: term.cases.map(c => this.expand(c)).toArray()
    });
  }

  expandFormalParameters(term) {
    let rest = term.rest == null ? null : this.expand(term.rest);
    return new Term('FormalParameters', {
      items: term.items.map(i => this.expand(i)),
      rest
    });
  }

  expandArrowExpression(term) {
    return this.doFunctionExpansion(term, 'ArrowExpression');
  }

  expandSwitchDefault(term) {
    return new Term('SwitchDefault', {
      consequent: term.consequent.map(c => this.expand(c)).toArray()
    });
  }

  expandSwitchCase(term) {
    return new Term('SwitchCase', {
      test: this.expand(term.test),
      consequent: term.consequent.map(c => this.expand(c)).toArray()
    });
  }

  expandForInStatement(term) {
    return new Term('ForInStatement', {
      left: this.expand(term.left),
      right: this.expand(term.right),
      body: this.expand(term.body)
    });
  }

  expandTryCatchStatement(term) {
    return new Term('TryCatchStatement', {
      body: this.expand(term.body),
      catchClause: this.expand(term.catchClause)
    });
  }

  expandTryFinallyStatement(term) {
    let catchClause = term.catchClause == null ? null : this.expand(term.catchClause);
    return new Term('TryFinallyStatement', {
      body: this.expand(term.body),
      catchClause,
      finalizer: this.expand(term.finalizer)
    });
  }

  expandCatchClause(term) {
    return new Term('CatchClause', {
      binding: this.expand(term.binding),
      body: this.expand(term.body)
    });
  }

  expandThrowStatement(term) {
    return new Term('ThrowStatement', {
      expression: this.expand(term.expression)
    });
  }

  expandForOfStatement(term) {
    return new Term('ForOfStatement', {
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
    return new Term('BindingPropertyProperty', {
      name: this.expand(term.name),
      binding: this.expand(term.binding)
    });
  }

  expandComputedPropertyName(term) {
    return new Term('ComputedPropertyName', {
      expression: this.expand(term.expression)
    });
  }

  expandObjectBinding(term) {
    return new Term('ObjectBinding', {
      properties: term.properties.map(t => this.expand(t)).toArray()
    });
  }

  expandArrayBinding(term) {
    let restElement = term.restElement == null ? null : this.expand(term.restElement);
    return new Term('ArrayBinding', {
      elements: term.elements.map(t => t == null ? null : this.expand(t)).toArray(),
      restElement
    });
  }

  expandBindingWithDefault(term) {
    return new Term('BindingWithDefault', {
      binding: this.expand(term.binding),
      init: this.expand(term.init)
    });
  }

  expandShorthandProperty(term) {
    // because hygiene, shorthand properties must turn into DataProperties
    return new Term('DataProperty', {
      name: new Term('StaticPropertyName', {
        value: term.name
      }),
      expression: new Term('IdentifierExpression', {
        name: term.name
      })
    });
  }


  expandForStatement(term) {
    let init = term.init == null ? null : this.expand(term.init);
    let test = term.test == null ? null : this.expand(term.test);
    let update = term.update == null ? null : this.expand(term.update);
    let body = this.expand(term.body);
    return new Term('ForStatement', { init, test, update, body });
  }

  expandYieldExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new Term('YieldExpression', {
      expression: expr
    });
  }

  expandYieldGeneratorExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new Term('YieldGeneratorExpression', {
      expression: expr
    });
  }

  expandWhileStatement(term) {
    return new Term('WhileStatement', {
      test: this.expand(term.test),
      body: this.expand(term.body)
    });
  }

  expandIfStatement(term) {
    let consequent = term.consequent == null ? null : this.expand(term.consequent);
    let alternate = term.alternate == null ? null : this.expand(term.alternate);
    return new Term('IfStatement', {
      test: this.expand(term.test),
      consequent: consequent,
      alternate: alternate
    });
  }

  expandBlockStatement(term) {
    return new Term('BlockStatement', {
      block: this.expand(term.block)
    });
  }

  expandBlock(term) {
    return new Term('Block', {
      statements: term.statements.map(s => this.expand(s)).toArray()
    });
  }

  expandVariableDeclarationStatement(term) {
    return new Term('VariableDeclarationStatement', {
      declaration: this.expand(term.declaration)
    });
  }
  expandReturnStatement(term) {
    if (term.expression == null) {
      return term;
    }
    return new Term("ReturnStatement", {
      expression: this.expand(term.expression)
    });
  }

  expandClassDeclaration(term) {
    return new Term('ClassDeclaration', {
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray()
    });
  }

  expandClassExpression(term) {
    return new Term('ClassExpression', {
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray()
    });
  }

  expandClassElement(term) {
    return new Term('ClassElement', {
      isStatic: term.isStatic,
      method: this.expand(term.method)
    });
  }

  expandThisExpression(term) {
    return term;
  }

  expandSyntaxTemplate(term) {
    let expander = new Expander(this.context);
    let r = processTemplate(term.template.inner());
    let str = Syntax.fromString(serializer.write(r.template));
    let callee = new Term('IdentifierExpression', { name: Syntax.fromIdentifier('syntaxTemplate') });

    let expandedInterps = r.interp.map(i => {
      let enf = new Enforester(i, List(), this.context);
      return this.expand(enf.enforest('expression'));
    });

    let args = List.of(new Term('LiteralStringExpression', {value: str }))
                   .concat(expandedInterps);

    return new Term('CallExpression', {
      callee, arguments: args
    });
  }

  expandSyntaxQuote(term) {
    let str = new Term("LiteralStringExpression", {
      value: Syntax.fromString(serializer.write(term.name))
    });

    return new Term("TemplateExpression", {
      tag: term.template.tag,
      elements: term.template.elements.push(str).push(new Term('TemplateElement', {
        rawValue: ''
      })).toArray()
    });
  }

  expandStaticMemberExpression(term) {
    return new Term("StaticMemberExpression", {
      object: this.expand(term.object),
      property: term.property
    });
  }

  expandArrayExpression(term) {
    return new Term("ArrayExpression", {
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
    return new Term('Export', {
      declaration: this.expand(term.declaration)
    });
  }

  expandExportDefault(term) {
    return new Term('ExportDefault', {
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
    return new Term("DataProperty", {
      name: this.expand(term.name),
      expression: this.expand(term.expression)
    });
  }


  expandObjectExpression(term) {
    return new Term("ObjectExpression", {
      properties: term.properties.map(t => this.expand(t))
    });
  }

  expandVariableDeclarator(term) {
    let init = term.init == null ? null : this.expand(term.init);
    return new Term("VariableDeclarator", {
      binding: this.expand(term.binding),
      init: init
    });
  }

  expandVariableDeclaration(term) {
    return new Term("VariableDeclaration", {
      kind: term.kind,
      declarators: term.declarators.map(d => this.expand(d))
    });
  }

  expandParenthesizedExpression(term) {
    if (term.inner.size === 0) {
      throw new Error("unexpected end of input");
    }
    let enf = new Enforester(term.inner, List(), this.context);
    let lookahead = enf.peek();
    let t = enf.enforestExpression();
    if (t == null || enf.rest.size > 0) {
      throw enf.createError(lookahead, "unexpected syntax");
    }
    return this.expand(t);
  }

  expandUnaryExpression(term) {
    return new Term('UnaryExpression', {
      operator: term.operator,
      operand: this.expand(term.operand)
    });
  }

  expandUpdateExpression(term) {
    return new Term('UpdateExpression', {
      isPrefix: term.isPrefix,
      operator: term.operator,
      operand: this.expand(term.operand)
    });
  }

  expandBinaryExpression(term) {
    let left = this.expand(term.left);
    let right = this.expand(term.right);
    return new Term("BinaryExpression", {
      left: left,
      operator: term.operator,
      right: right
    });
  }

  expandConditionalExpression(term) {
    return new Term('ConditionalExpression', {
      test: this.expand(term.test),
      consequent: this.expand(term.consequent),
      alternate: this.expand(term.alternate)
    });
  }

  expandNewTargetExpression(term) { return term; }

  expandNewExpression(term) {
    let callee = this.expand(term.callee);
    let enf = new Enforester(term.arguments, List(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new Term('NewExpression', {
      callee,
      arguments: args.toArray()
    });
  }

  expandSuper(term) { return term; }

  expandCallExpression(term) {
    let callee = this.expand(term.callee);
    let enf = new Enforester(term.arguments, List(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new Term("CallExpression", {
      callee: callee,
      arguments: args
    });
  }

  expandSpreadElement(term) {
    return new Term('SpreadElement', {
      expression: this.expand(term.expression)
    });
  }

  expandExpressionStatement(term) {
    let child = this.expand(term.expression);
    return new Term("ExpressionStatement", {
      expression: child
    });
  }

  expandLabeledStatement(term) {
    return new Term('LabeledStatement', {
      label: term.label.val(),
      body: this.expand(term.body)
    });
  }

  doFunctionExpansion(term, type) {
    let scope = freshScope("fun");
    let red = new ApplyScopeInParamsReducer(scope, this.context);
    let params;
    if (type !== 'Getter' && type !== 'Setter') {
      params = red.transform(term.params);
      params = this.expand(params);
    }
    this.context.currentScope.push(scope);
    let expander = new Expander(this.context);

    let markedBody, bodyTerm;
    if (term.body instanceof Term) {
      // Arrow functions have a single term as their body
      bodyTerm = this.expand(term.body.addScope(scope, this.context.bindings));
    } else {
      markedBody = term.body.map(b => b.addScope(scope, this.context.bindings));
      bodyTerm = new Term("FunctionBody", {
        directives: List(),
        statements: expander.expand(markedBody)
      });
    }
    this.context.currentScope.pop();

    if (type === 'Getter') {
      return new Term(type, {
        name: this.expand(term.name),
        body: bodyTerm
      });
    } else if (type === 'Setter') {
      return new Term(type, {
        name: this.expand(term.name),
        param: term.param,
        body: bodyTerm
      });
    }
    return new Term(type, {
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
    return new Term("CompoundAssignmentExpression", {
      binding: this.expand(term.binding),
      operator: term.operator,
      expression: this.expand(term.expression)
    });
  }

  expandAssignmentExpression(term) {
    return new Term("AssignmentExpression", {
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
    let trans = this.context.env.get(term.name.resolve());
    if (trans) {
      return new Term("IdentifierExpression", {
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
