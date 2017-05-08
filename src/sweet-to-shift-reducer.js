// @flow
import Term, * as S from 'sweet-spec';
import { complement } from 'ramda';
import { List } from 'immutable';

import { isEmptyStatement } from './terms';

import type Syntax from './syntax.js';

const notEmptyStatement = complement(isEmptyStatement);

// $FlowFixMe: flow doesn't know about CloneReducer yet
export default class extends Term.CloneReducer {
  phase: number;

  constructor(phase: number) {
    super();
    this.phase = phase;
  }

  reduceModule(t: Term, s: { directives: List<any>, items: List<any> }) {
    return new S.Module({
      directives: s.directives.toArray(),
      items: s.items.toArray().filter(notEmptyStatement),
    });
  }

  reduceIdentifierExpression(t: Term, s: { name: Syntax }) {
    return new S.IdentifierExpression({
      name: s.name.resolve(this.phase),
    });
  }

  reduceStaticPropertyName(t: Term, s: { value: Syntax }) {
    return new S.StaticPropertyName({
      value: s.value.val().toString(),
    });
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    return new S.BindingIdentifier({
      name: s.name.resolve(this.phase),
    });
  }

  reduceStaticMemberExpression(t: Term, s: { object: any, property: Syntax }) {
    return new S.StaticMemberExpression({
      object: s.object,
      property: s.property.val(),
    });
  }

  reduceFunctionBody(
    t: Term,
    s: { statements: List<any>, directives: List<any> },
  ) {
    return new S.FunctionBody({
      directives: s.directives.toArray(),
      statements: s.statements.toArray().filter(notEmptyStatement),
    });
  }

  reduceVariableDeclarationStatement(t: any, s: { declaration: any }) {
    if (
      t.declaration.kind === 'syntax' ||
      t.declaration.kind === 'syntaxrec' ||
      t.declaration.kind === 'operator'
    ) {
      return new S.EmptyStatement();
    }
    return new S.VariableDeclarationStatement({
      declaration: s.declaration,
    });
  }

  reduceVariableDeclaration(t: Term, s: { kind: any, declarators: List<any> }) {
    return new S.VariableDeclaration({
      kind: s.kind,
      declarators: s.declarators.toArray(),
    });
  }

  reduceCallExpression(t: Term, s: { callee: any, arguments: List<any> }) {
    return new S.CallExpression({
      callee: s.callee,
      arguments: s.arguments.toArray(),
    });
  }

  reduceArrayExpression(t: Term, s: { elements: List<any> }) {
    return new S.ArrayExpression({
      elements: s.elements.toArray(),
    });
  }

  reduceImport() {
    return new S.EmptyStatement({});
  }

  reduceBlock(t: Term, s: { statements: List<any> }) {
    return new S.Block({
      statements: s.statements.toArray().filter(notEmptyStatement),
    });
  }
}
