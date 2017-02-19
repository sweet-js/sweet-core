// @flow
import Term, * as S from 'sweet-spec';
import { List } from 'immutable';

export default class extends Term.CloneReducer {
  phase: number;

  constructor(phase: number) {
    super();
    this.phase = phase;
  }

  reduceModule(t: Term, s: { directives: List<any>, items: List<any> }) {
    return new S.Module({
      directives: s.directives.toArray(),
      items: s.items.toArray()
    });
  }

  reduceIdentifierExpression(t: Term, s: Term) {
    return new S.IdentifierExpression({
      // TODO: resolve
      // name: s.name.resolve(this.phase)
      name: s.name.value
    });
  }

  reduceStaticPropertyName(t: Term, s: Term) {
    return new S.StaticPropertyName({
      value: s.value.value
    });
  }

  reduceBindingIdentifier(t: Term, s: Term) {
    return new S.BindingIdentifier({
      // TODO: resolve
      // name: s.name.resolve(this.phase)
      name: s.name.value
    });
  }

  reduceStaticMemberExpression(t: Term, s: Term) {
    return new S.StaticMemberExpression({
      object: s.object,
      property: s.property.value
    });
  }

  reduceFunctionBody(t: Term, s: { statements: List<any>, directives: List<any> }) {
    return new S.FunctionBody({
      directives: s.directives.toArray(),
      statements: s.statements.toArray()
    });
  }

  reduceVariableDeclarationStatement(t: Term, s: { declaration: any }) {
    if (t.declaration.kind === 'syntax' || t.declaration.kind === 'syntaxrec') {
      return new S.EmptyStatement();
    }
    return new S.VariableDeclarationStatement({
      declaration: s.declaration
    });
  }

  reduceVariableDeclaration(t: Term, s: { kind: any, declarators: List<any> }) {
    return new S.VariableDeclaration({
      kind: s.kind,
      declarators: s.declarators.toArray()
    });
  }

  reduceCallExpression(t: Term, s: { callee: any, arguments: List<any> }) {
    return new S.CallExpression({
      callee: s.callee,
      arguments: s.arguments.toArray()
    });
  }

  reduceArrayExpression(t: Term, s: { elements: List<any> }) {
    return new S.ArrayExpression({
      elements: s.elements.toArray()
    });
  }

  reduceImport() {
    return new S.EmptyStatement({});
  }

  reduceBlock(t: Term, s: { statements: List<any> }) {
    return new S.Block({
      statements: s.statements.toArray()
    });
  }
}
