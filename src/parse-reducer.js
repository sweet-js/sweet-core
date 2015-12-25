import Term from "./terms";
import { CloneReducer } from "shift-reducer";

export default class ParseReducer extends CloneReducer {
  reduceModule(node, state) {
    return new Term("Module", {
      directives: state.directives.toArray(),
      items: state.items.toArray()
    });
  }

  reduceIdentifierExpression(node, state) {
    return new Term("IdentifierExpression", {
      name: node.name.resolve()
    });
  }

  reduceLiteralNumericExpression(node, state) {
    return new Term("LiteralNumericExpression", {
      value: node.value.val()
    });
  }

  reduceLiteralBooleanExpression(node, state) {
    return new Term("LiteralBooleanExpression", {
      value: node.value.val() === 'true'
    });
  }

  reduceLiteralStringExpression(node, state) {
    return new Term("LiteralStringExpression", {
      value: node.value.token.str
    });
  }

  reduceCallExpression(node, state) {
    return new Term("CallExpression", {
      callee: state.callee,
      arguments: state.arguments.toArray()
    });
  }

  reduceFunctionBody(node, state) {
    return new Term("FunctionBody", {
      directives: state.directives.toArray(),
      statements: state.statements.toArray()
    });
  }

  reduceFormalParameters(node, state) {
    return new Term("FormalParameters", {
      items: state.items.toArray(),
      rest: state.rest
    });
  }

  reduceBindingIdentifier(node, state) {
    return new Term("BindingIdentifier", {
      name: node.name.resolve()
    });
  }

  reduceBinaryExpression(node, state) {
    return new Term("BinaryExpression", {
      left: state.left,
      operator: node.operator.val(),
      right: state.right
    });
  }

  reduceObjectExpression(node, state) {
    return new Term("ObjectExpression", {
      properties: state.properties.toArray()
    });
  }

  reduceVariableDeclaration(node, state) {
    return new Term("VariableDeclaration", {
      kind: state.kind,
      declarators: state.declarators.toArray()
    });
  }

  reduceStaticPropertyName(node, state) {
    return new Term("StaticPropertyName", {
      value: node.value.val()
    });
  }

  reduceArrayExpression(node, state) {
    return new Term("ArrayExpression", {
      elements: state.elements.toArray()
    });
  }

  reduceStaticMemberExpression(node, state) {
    return new Term("StaticMemberExpression", {
      object: state.object,
      property: state.property.val()
    });
  }

  reduceClassDeclaration(node, state) {
    return new Term("ClassDeclaration", {
      name: state.name,
      super: state.super,
      elements: state.elements.toArray(),
      loc: null
    });
  }
}
