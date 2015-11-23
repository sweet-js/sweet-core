import read from "./reader";
import expand from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel";
import reduce, { MonoidalReducer, CloneReducer } from "shift-reducer";

import * as T from "./terms";

function tokenArrayToSyntaxList(toks) {
    return List(toks.map(t => {
        if (Array.isArray(t.inner)) {
            return new T.DelimiterTerm(new Syntax(t),
                                     tokenArrayToSyntaxList(t.inner));
        }
        return new T.SyntaxTerm(new Syntax(t));
    }));
}

export function readAsTerms(code) {
    return tokenArrayToSyntaxList(read(code));
}

class ParseReducer extends CloneReducer {
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
}

export function parse(source, options = {}) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {env: new Env()});
    let ast = reduce.default(new ParseReducer(), new T.ModuleTerm(List(), exStxl));
    return ast;
}

export function compile(source) {
    let ast = parse(source);
    let code = transform.fromAst(ast);
    return code.code;
}


function expandForExport(source) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {env: new Env()});
    return new T.ModuleTerm(List(), exStxl);
}
export {expandForExport as expand};
