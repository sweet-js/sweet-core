import { List } from 'immutable';
import { isExpressionStatement, isLiteralStringExpression } from './terms';
import Term, * as T from 'sweet-spec';
import { freshScope } from './scope';
import Compiler from './compiler';
import { ALL_PHASES } from './syntax';
import { Enforester } from './enforester';
import { processTemplate } from './template-processor';
import ASTDispatcher from './ast-dispatcher';
import ScopeReducer from './scope-reducer';
import { gensym } from './symbol';
import { VarBindingTransform } from './transforms';
import Syntax from './syntax';

export default class TermExpander extends ASTDispatcher {
  constructor(context) {
    super('expand', true);
    this.context = context;
  }

  expand(term) {
    return this.dispatch(term);
  }

  expandRawSyntax(term) {
    return term;
  }

  expandRawDelimiter(term) {
    return term;
  }

  expandTemplateExpression(term) {
    return new T.TemplateExpression({
      tag: term.tag == null ? null : this.expand(term.tag),
      elements: term.elements.toArray(),
    });
  }

  expandBreakStatement(term) {
    return new T.BreakStatement({
      label: term.label ? term.label.val() : null,
    });
  }

  expandDoWhileStatement(term) {
    return new T.DoWhileStatement({
      body: this.expand(term.body),
      test: this.expand(term.test),
    });
  }

  expandWithStatement(term) {
    return new T.WithStatement({
      body: this.expand(term.body),
      object: this.expand(term.object),
    });
  }

  expandDebuggerStatement(term) {
    return term;
  }

  expandContinueStatement(term) {
    return new T.ContinueStatement({
      label: term.label ? term.label.val() : null,
    });
  }

  expandSwitchStatementWithDefault(term) {
    return new T.SwitchStatementWithDefault({
      discriminant: this.expand(term.discriminant),
      preDefaultCases: term.preDefaultCases.map(c => this.expand(c)).toArray(),
      defaultCase: this.expand(term.defaultCase),
      postDefaultCases: term.postDefaultCases
        .map(c => this.expand(c))
        .toArray(),
    });
  }

  expandComputedMemberExpression(term) {
    return new T.ComputedMemberExpression({
      object: this.expand(term.object),
      expression: this.expand(term.expression),
    });
  }

  expandSwitchStatement(term) {
    return new T.SwitchStatement({
      discriminant: this.expand(term.discriminant),
      cases: term.cases.map(c => this.expand(c)).toArray(),
    });
  }

  expandFormalParameters(term) {
    let rest = term.rest == null ? null : this.expand(term.rest);
    return new T.FormalParameters({
      items: term.items.map(i => this.expand(i)),
      rest,
    });
  }

  expandArrowExpressionE(term) {
    return this.doFunctionExpansion(term, 'ArrowExpression');
  }

  expandArrowExpression(term) {
    return this.doFunctionExpansion(term, 'ArrowExpression');
  }

  expandSwitchDefault(term) {
    return new T.SwitchDefault({
      consequent: term.consequent.map(c => this.expand(c)).toArray(),
    });
  }

  expandSwitchCase(term) {
    return new T.SwitchCase({
      test: this.expand(term.test),
      consequent: term.consequent.map(c => this.expand(c)).toArray(),
    });
  }

  expandForInStatement(term) {
    return new T.ForInStatement({
      left: this.expand(term.left),
      right: this.expand(term.right),
      body: this.expand(term.body),
    });
  }

  expandTryCatchStatement(term) {
    return new T.TryCatchStatement({
      body: this.expand(term.body),
      catchClause: this.expand(term.catchClause),
    });
  }

  expandTryFinallyStatement(term) {
    let catchClause =
      term.catchClause == null ? null : this.expand(term.catchClause);
    return new T.TryFinallyStatement({
      body: this.expand(term.body),
      catchClause,
      finalizer: this.expand(term.finalizer),
    });
  }

  expandCatchClause(term) {
    return new T.CatchClause({
      binding: this.expand(term.binding),
      body: this.expand(term.body),
    });
  }

  expandThrowStatement(term) {
    return new T.ThrowStatement({
      expression: this.expand(term.expression),
    });
  }

  expandForOfStatement(term) {
    return new T.ForOfStatement({
      left: this.expand(term.left),
      right: this.expand(term.right),
      body: this.expand(term.body),
    });
  }

  expandBindingIdentifier(term) {
    return term;
  }

  expandAssignmentTargetIdentifier(term) {
    return term;
  }

  expandBindingPropertyIdentifier(term) {
    return term;
  }

  expandAssignmentTargetPropertyIdentifier(term) {
    return term;
  }

  expandBindingPropertyProperty(term) {
    return new T.BindingPropertyProperty({
      name: this.expand(term.name),
      binding: this.expand(term.binding),
    });
  }

  expandAssignmentTargetPropertyProperty(term) {
    return new T.AssignmentTargetPropertyProperty({
      name: this.expand(term.name),
      binding: this.expand(term.binding),
    });
  }

  expandComputedPropertyName(term) {
    return new T.ComputedPropertyName({
      expression: this.expand(term.expression),
    });
  }

  expandObjectBinding(term) {
    return new T.ObjectBinding({
      properties: term.properties.map(t => this.expand(t)).toArray(),
    });
  }

  expandObjectAssignmentTarget(term) {
    return new T.ObjectAssignmentTarget({
      properties: term.properties.map(t => this.expand(t)).toArray(),
    });
  }

  expandArrayBinding(term) {
    let rest = term.rest == null ? null : this.expand(term.rest);
    return new T.ArrayBinding({
      elements: term.elements
        .map(t => (t == null ? null : this.expand(t)))
        .toArray(),
      rest,
    });
  }

  expandArrayAssignmentTarget(term) {
    let rest = term.rest == null ? null : this.expand(term.rest);
    return new T.ArrayAssignmentTarget({
      elements: term.elements
        .map(t => (t == null ? null : this.expand(t)))
        .toArray(),
      rest,
    });
  }

  expandBindingWithDefault(term) {
    return new T.BindingWithDefault({
      binding: this.expand(term.binding),
      init: this.expand(term.init),
    });
  }

  expandAssignmentTargetWithDefault(term) {
    return new T.AssignmentTargetWithDefault({
      binding: this.expand(term.binding),
      init: this.expand(term.init),
    });
  }

  expandShorthandProperty(term) {
    // because hygiene, shorthand properties must turn into DataProperties
    return new T.DataProperty({
      name: new T.StaticPropertyName({
        value: term.name,
      }),
      expression: new T.IdentifierExpression({
        name: term.name,
      }),
    });
  }

  expandForStatement(term) {
    let init = term.init == null ? null : this.expand(term.init);
    let test = term.test == null ? null : this.expand(term.test);
    let update = term.update == null ? null : this.expand(term.update);
    let body = this.expand(term.body);
    return new T.ForStatement({ init, test, update, body });
  }

  expandYieldExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new T.YieldExpression({
      expression: expr,
    });
  }

  expandYieldGeneratorExpression(term) {
    let expr = term.expression == null ? null : this.expand(term.expression);
    return new T.YieldGeneratorExpression({
      expression: expr,
    });
  }

  expandWhileStatement(term) {
    return new T.WhileStatement({
      test: this.expand(term.test),
      body: this.expand(term.body),
    });
  }

  expandIfStatement(term) {
    let consequent =
      term.consequent == null ? null : this.expand(term.consequent);
    let alternate = term.alternate == null ? null : this.expand(term.alternate);
    return new T.IfStatement({
      test: this.expand(term.test),
      consequent: consequent,
      alternate: alternate,
    });
  }

  expandBlockStatement(term) {
    return new T.BlockStatement({
      block: this.expand(term.block),
    });
  }

  expandBlock(term) {
    let scope = freshScope('block');
    this.context.currentScope.push(scope);
    let compiler = new Compiler(
      this.context.phase,
      this.context.env,
      this.context.store,
      this.context,
    );

    let markedBody, bodyTerm;
    markedBody = term.statements.map(b =>
      b.reduce(
        new ScopeReducer(
          [{ scope, phase: ALL_PHASES, flip: false }],
          this.context.bindings,
        ),
      ),
    );
    bodyTerm = new T.Block({
      statements: compiler.compile(markedBody),
    });
    this.context.currentScope.pop();
    return bodyTerm;
  }

  expandVariableDeclarationStatement(term) {
    return new T.VariableDeclarationStatement({
      declaration: this.expand(term.declaration),
    });
  }
  expandReturnStatement(term) {
    if (term.expression == null) {
      return term;
    }
    return new T.ReturnStatement({
      expression: this.expand(term.expression),
    });
  }

  expandClassDeclaration(term) {
    return new T.ClassDeclaration({
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray(),
    });
  }

  expandClassExpression(term) {
    return new T.ClassExpression({
      name: term.name == null ? null : this.expand(term.name),
      super: term.super == null ? null : this.expand(term.super),
      elements: term.elements.map(el => this.expand(el)).toArray(),
    });
  }

  expandClassElement(term) {
    return new T.ClassElement({
      isStatic: term.isStatic,
      method: this.expand(term.method),
    });
  }

  expandThisExpression(term) {
    return term;
  }

  expandSyntaxTemplate(term) {
    let r = processTemplate(term.template.slice(1, term.template.size - 1));
    let ident = this.context.getTemplateIdentifier();
    this.context.templateMap.set(ident, r.template);
    let name = Syntax.fromIdentifier(
      'syntaxTemplate',
      term.template.first().value,
    );
    let callee = new T.IdentifierExpression({
      name: name,
    });

    let expandedInterps = r.interp.map(i => {
      let enf = new Enforester(i, List(), this.context);
      return this.expand(enf.enforest('expression'));
    });

    let args = List.of(new T.LiteralNumericExpression({ value: ident })).concat(
      expandedInterps,
    );

    return new T.CallExpression({
      callee,
      arguments: args,
    });
  }

  expandStaticMemberExpression(term) {
    return new T.StaticMemberExpression({
      object: this.expand(term.object),
      property: term.property,
    });
  }

  expandStaticMemberAssignmentTarget(term) {
    return new T.StaticMemberAssignmentTarget({
      object: this.expand(term.object),
      property: term.property,
    });
  }

  expandComputedMemberAssignmentTarget(term) {
    return new T.ComputedMemberAssignmentTarget({
      object: this.expand(term.object),
      expression: this.expand(term.expression),
    });
  }

  expandArrayExpression(term) {
    return new T.ArrayExpression({
      elements: term.elements.map(t => (t == null ? t : this.expand(t))),
    });
  }

  expandImport(term) {
    return term;
  }

  expandImportNamespace(term) {
    return term;
  }

  expandExport(term) {
    return new T.Export({
      declaration: this.expand(term.declaration),
    });
  }

  expandExportDefault(term) {
    return new T.ExportDefault({
      body: this.expand(term.body),
    });
  }

  expandExportFrom(term) {
    return term;
  }

  expandExportLocals(term) {
    return term;
  }

  expandExportAllFrom(term) {
    return term;
  }

  expandExportFromSpecifier(term) {
    return term;
  }

  expandExportLocalSpecifier(term) {
    return term;
  }

  expandStaticPropertyName(term) {
    return term;
  }

  expandDataProperty(term) {
    return new T.DataProperty({
      name: this.expand(term.name),
      expression: this.expand(term.expression),
    });
  }

  expandObjectExpression(term) {
    return new T.ObjectExpression({
      properties: term.properties.map(t => this.expand(t)),
    });
  }

  expandVariableDeclarator(term) {
    let init = term.init == null ? null : this.expand(term.init);
    return new T.VariableDeclarator({
      binding: this.expand(term.binding),
      init: init,
    });
  }

  expandVariableDeclaration(term) {
    if (
      term.kind === 'syntax' ||
      term.kind === 'syntaxrec' ||
      term.kind === 'operator'
    ) {
      return term;
    }
    return new T.VariableDeclaration({
      kind: term.kind,
      declarators: term.declarators.map(d => this.expand(d)),
    });
  }

  expandParenthesizedExpression(term) {
    if (term.inner.size === 0) {
      throw new Error('unexpected end of input');
    }
    let enf = new Enforester(term.inner, List(), this.context);
    let lookahead = enf.peek();
    let t = enf.enforestExpression();
    if (t == null || enf.rest.size > 0) {
      if (enf.rest.size === 0) {
        throw enf.createError(')', 'unexpected token');
      }
      throw enf.createError(lookahead, 'unexpected syntax');
    }
    return this.expand(t);
  }

  expandUnaryExpression(term) {
    if (term.operator === 'await') {
      return new T.AwaitExpression({
        expression: this.expand(term.operand),
      });
    }
    return new T.UnaryExpression({
      operator: term.operator,
      operand: this.expand(term.operand),
    });
  }

  expandUpdateExpression(term) {
    return new T.UpdateExpression({
      isPrefix: term.isPrefix,
      operator: term.operator,
      operand: this.expand(term.operand),
    });
  }

  expandBinaryExpression(term) {
    let left = this.expand(term.left);
    let right = this.expand(term.right);
    return new T.BinaryExpression({
      left: left,
      operator: term.operator,
      right: right,
    });
  }

  expandConditionalExpression(term) {
    return new T.ConditionalExpression({
      test: this.expand(term.test),
      consequent: this.expand(term.consequent),
      alternate: this.expand(term.alternate),
    });
  }

  expandNewTargetExpression(term) {
    return term;
  }

  expandNewExpression(term) {
    let callee = this.expand(term.callee);
    let enf = new Enforester(term.arguments, List(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new T.NewExpression({
      callee,
      arguments: args.toArray(),
    });
  }

  expandSuper(term) {
    return term;
  }

  expandCallExpressionE(term) {
    let callee = this.expand(term.callee);
    let enf = new Enforester(term.arguments, List(), this.context);
    let args = enf.enforestArgumentList().map(arg => this.expand(arg));
    return new T.CallExpression({
      callee: callee,
      arguments: args,
    });
  }

  expandSpreadElement(term) {
    return new T.SpreadElement({
      expression: this.expand(term.expression),
    });
  }

  expandExpressionStatement(term) {
    let child = this.expand(term.expression);
    return new T.ExpressionStatement({
      expression: child,
    });
  }

  expandLabeledStatement(term) {
    return new T.LabeledStatement({
      label: term.label.val(),
      body: this.expand(term.body),
    });
  }

  doFunctionExpansion(term, type) {
    let scope = freshScope('fun');
    let params;
    let self = this;
    if (type !== 'Getter' && type !== 'Setter') {
      // TODO: need to register the parameter bindings again
      params = term.params.reduce(
        new class extends Term.CloneReducer {
          reduceBindingIdentifier(term) {
            let name = term.name.addScope(
              scope,
              self.context.bindings,
              ALL_PHASES,
            );
            let newBinding = gensym(name.val());

            self.context.env.set(
              newBinding.toString(),
              new VarBindingTransform(name),
            );
            self.context.bindings.add(name, {
              binding: newBinding,
              phase: self.context.phase,
              skipDup: true,
            });
            return new T.BindingIdentifier({ name });
          }
        }(),
      );
      params = this.expand(params);
    }
    this.context.currentScope.push(scope);
    let compiler = new Compiler(
      this.context.phase,
      this.context.env,
      this.context.store,
      Object.assign({}, this.context, { allowAwait: term.isAsync }),
    );

    let bodyTerm;
    let scopeReducer = new ScopeReducer(
      [{ scope, phase: ALL_PHASES, flip: false }],
      this.context.bindings,
    );
    if (term.body instanceof Term) {
      // Arrow functions have a single term as their body
      bodyTerm = this.expand(term.body.reduce(scopeReducer));
    } else {
      let compiledBody = compiler.compile(
        term.body.map(b => b.reduce(scopeReducer)),
      );
      const directives = compiledBody
        .takeWhile(
          s =>
            isExpressionStatement(s) && isLiteralStringExpression(s.expression),
        )
        .map(s => new T.Directive({ rawValue: s.expression.value }));
      bodyTerm = new T.FunctionBody({
        directives: directives,
        statements: compiledBody.slice(directives.size),
      });
    }
    this.context.currentScope.pop();

    switch (type) {
      case 'Getter':
        return new T.Getter({
          name: this.expand(term.name),
          body: bodyTerm,
        });
      case 'Setter':
        return new T.Setter({
          name: this.expand(term.name),
          param: term.param,
          body: bodyTerm,
        });
      case 'Method':
        return new T.Method({
          name: term.name,
          isAsync: term.isAsync,
          isGenerator: term.isGenerator,
          params: params,
          body: bodyTerm,
        });
      case 'ArrowExpression':
        return new T.ArrowExpression({
          isAsync: term.isAsync,
          params: params,
          body: bodyTerm,
        });
      case 'FunctionExpression':
        return new T.FunctionExpression({
          name: term.name,
          isAsync: term.isAsync,
          isGenerator: term.isGenerator,
          params: params,
          body: bodyTerm,
        });
      case 'FunctionDeclaration':
        return new T.FunctionDeclaration({
          name: term.name,
          isAsync: term.isAsync,
          isGenerator: term.isGenerator,
          params: params,
          body: bodyTerm,
        });
      default:
        throw new Error(`Unknown function type: ${type}`);
    }
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

  expandFunctionDeclarationE(term) {
    return this.doFunctionExpansion(term, 'FunctionDeclaration');
  }

  expandFunctionExpressionE(term) {
    return this.doFunctionExpansion(term, 'FunctionExpression');
  }

  expandCompoundAssignmentExpression(term) {
    return new T.CompoundAssignmentExpression({
      binding: this.expand(term.binding),
      operator: term.operator,
      expression: this.expand(term.expression),
    });
  }

  expandAssignmentExpression(term) {
    return new T.AssignmentExpression({
      binding: this.expand(term.binding),
      expression: this.expand(term.expression),
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
    if (trans && trans.id) {
      return new T.IdentifierExpression({
        name: trans.id,
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
