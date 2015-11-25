import * as T from "./terms";
import { CloneReducer } from "shift-reducer";

export default class ParseReducer extends CloneReducer {
    reduceIdentifierExpression(node, state) {
        return new T.IdentifierExpressionTerm(node.name.resolve());
    }
    reduceLiteralNumericExpression(node, state) {
        return new T.LiteralNumericExpressionTerm(node.value.val());
    }
    reduceLiteralBooleanExpression(node, state) {
        return new T.LiteralBooleanExpressionTerm(node.value.val() === 'true');
    }
    reduceLiteralStringExpression(node, state) {
        return new T.LiteralStringExpressionTerm(node.value.val());
    }
    reduceCallExpression(node, state) {
        return new T.CallExpressionTerm(state.callee, state.arguments.toArray());
    }
    reduceFunctionBody(node, state) {
        return new T.FunctionBodyTerm(state.directives.toArray(), state.statements.toArray());
    }
    reduceFormalParameters(node, state) {
        return new T.FormalParametersTerm(state.items.toArray(), state.rest);
    }
    reduceBindingIdentifier(node, state) {
        return new T.BindingIdentifierTerm(node.name.resolve());
    }
    reduceBinaryExpression(node, state) {
        return new T.BinaryExpressionTerm(state.left, node.operator.val(), state.right);
    }
    reduceObjectExpression(node, state) {
        return new T.ObjectExpressionTerm(state.properties.toArray());
    }
    reduceVariableDeclaration(node, state) {
        return new T.VariableDeclarationTerm(state.kind, state.declarators.toArray());
    }
    reduceStaticPropertyName(node, state) {
        return new T.StaticPropertyNameTerm(node.value.val());
    }
    reduceArrayExpression(node, state) {
        return new T.ArrayExpressionTerm(state.elements.toArray());
    }
    reduceStaticMemberExpression(node, state) {
        return new T.StaticMemberExpressionTerm(state.object, state.property.val());
    }
}
