import { List } from "immutable";
import { assert, expect } from "./errors";
import { mixin } from "./utils";
import Syntax from "./syntax";


export class Term {
    constructor(loc = null) {
        this.loc = loc;
    }
    getSyntax() {
        return List();
    }
}

// TODO: remove since I don't think we really need this
export class EOFTerm extends Term {
    constructor() {
        super();
        this.type = "EOFTerm";
    }
}

// SyntaxTerm and DelimiterTerm are just for use in sweet.js, not part
// of the shift AST spec
export class SyntaxTerm extends Term {
    constructor(stx) {
        super();
        this.type = "SyntaxTerm";
        assert(stx instanceof Syntax, "expecting a syntax object");
        this.stx = stx;
    }

    getSyntax() {
        return List([this.stx]);
    }
}

export class DelimiterTerm extends SyntaxTerm {
    constructor(stx, inner) {
        super(stx);
        this.type = "DelimiterTerm";
        assert(stx.isDelimiter(), "expecting a delimiter syntax object");
        this.kind = stx.token.value;
        this.inner = inner;
    }
    getSyntax() {
        return this.inner;
    }
}

// sweet extension to the shift AST
export class CompileTimeTerm extends Term {}
export class ModuleTerm extends Term {
    constructor(directives, items) {
        super();
        this.type = "Module";
        this.directives = directives;
        this.items = items;
    }
}


export class ScriptTerm extends Term {
    constructor(directives, statements) {
        super();
        this.type = "Script";
        this.directives = directives;
        this.statements = statements;
    }
}

export class BindingWithDefaultTerm extends Term {
    constructor(binding, init) {
        super();
        this.type = "BindingWithDefault";
        this.binding = binding;
        this.init = init;
    }
}

export class BindingIdentifierTerm extends Term {
    constructor(name) {
        super();
        this.type = "BindingIdentifier";
        this.name = name;
    }
}
export class ArrayBindingTerm extends Term {
    constructor(elements, restElement = null) {
        super();
        this.type = "ArrayBinding";
        this.elements = elements;
        this.restElement = restElement;
    }
}
export class ObjectBindingTerm extends Term {
    constructor(properties) {
        super();
        this.type = "ObjectBinding";
        this.properties = properties;
    }
}
export class BindingPropertyTerm extends Term { }
export class BindingPropertyIdentifierTerm extends BindingPropertyTerm {
    constructor(binding, init = null) {
        super();
        this.type = "BindingPropertyIdentifier";
        this.binding = binding;
        this.init = init;
    }
}
export class BindingPropertyPropertyTerm extends BindingPropertyTerm {
    constructor(name, binding) {
        super();
        this.type = "BindingPropertyProperty";
        this.name = name;
        this.binding = binding;
    }
}



export class StatementTerm extends Term { }
export class DeclarationTerm extends StatementTerm { }
export class EmptyStatementTerm extends StatementTerm { }
export class ReturnStatementTerm extends StatementTerm {
    constructor(argument) {
        super();

        this.argument = argument;
    }
}
export class BlockStatementTerm extends StatementTerm {
    constructor(body) {
        super();
        this.body = body;
    }
}
export class ExpressionStatementTerm extends StatementTerm {
    constructor(expression) {
        super();
        this.type = "ExpressionStatement";
        this.expression = expression;
    }
}
export class FunctionDeclarationTerm extends DeclarationTerm {
    constructor(name, isGenerator, params, body) {
        super();
        this.type = "FunctionDeclaration";
        this.name = name;
        this.isGenerator = isGenerator;
        this.params = params;
        this.body = body;
    }
}
export class VariableDeclarationTerm extends Term {
    constructor(kind, declarators) {
        super();
        this.type = "VariableDeclaration";
        this.kind = kind;
        this.declarators = declarators;
    }
}
export class VariableDeclaratorTerm extends Term {
    constructor(binding, init) {
        super();
        this.type = "VariableDeclarator";
        this.binding = binding;
        this.init = init;
    }
}


export class ExpressionTerm extends Term { }
export class SyntaxQuoteTerm extends ExpressionTerm {
    constructor(name, stx) {
        super();

        this.name = name; // for hygiene purposes

        this.stx = stx;
    }
}


export class IdentifierExpressionTerm extends ExpressionTerm {
    constructor(name) {
        super();
        this.type = "IdentifierExpression";
        // syntax
        this.name = name;
    }
}

export class LiteralNumericExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.type = "LiteralNumericExpression";
        this.value = value;
    }
}
export class LiteralInfinityExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.type = "LiteralInfinityExpression";
        // syntax
        this.value = value;
    }
}


export class LiteralStringExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.type = "LiteralStringExpression";
        this.value = value;
    }
}


export class LiteralBooleanExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.type = "LiteralBooleanExpression";
        this.value = value;
    }
}


export class LiteralNullExpressionTerm extends ExpressionTerm {
    constructor() {
        super();
        this.type = "LiteralNullExpression";
    }
}


export class LiteralRegExpExpressionTerm extends ExpressionTerm {
    constructor(pattern, flags) {
        super();
        this.type = "LiteralRegExpExpression";
        this.pattern = pattern;
        this.flags = flags;
    }
}

export class ArrayExpressionTerm extends ExpressionTerm {
    constructor(elements) {
        super();
        this.type = "ArrayExpression";
        // (SpreadElement or Expression)?[]
        this.elements = elements;
    }
}

export class ObjectExpressionTerm extends ExpressionTerm {
    constructor(properties) {
        super();
        this.type = "ObjectExpression";
        // [ObjectProperty]
        this.properties = properties;
    }
}
export class ObjectPropertyTerm extends Term { }
export class NamedObjectPropertyTerm extends ObjectPropertyTerm {
    constructor(name) {
        super();
        this.type = "NamedObjectProperty";
        // PropertyName
        this.name = name;
    }
}
export class PropertyNameTerm extends Term { }
export class StaticPropertyNameTerm extends PropertyNameTerm {
    constructor(value) {
        super();
        this.type = "StaticPropertyName";
        // Syntax ... string
        this.value = value;
    }
}
export class ComputedPropertyNameTerm extends PropertyNameTerm {
    constructor(expression) {
        super();
        this.type = "ComputedPropertyName";
        // Expression
        this.expression = expression;
    }
}
export class DataPropertyTerm extends NamedObjectPropertyTerm {
    constructor(name, expression) {
        super(name);
        this.type = "DataProperty";
        // Expression
        this.expression = expression;
    }
}
export class MethodDefinitionTerm extends NamedObjectPropertyTerm {
    constructor(body) {
        super();
        this.type = "MethodDefinition";
        this.body = body;
    }
}
export class MemberExpressionTerm extends ExpressionTerm {
    constructor(object, property, computed) {
        super();

        this.object = object;
        this.property = property;
        this.computed = computed;
    }
}
export class CallExpressionTerm extends ExpressionTerm {
    constructor(callee, args) {
        super();
        this.type = "CallExpression";
        this.callee = callee;
        this.arguments = args;
    }
}

export class BinaryExpressionTerm extends ExpressionTerm {
    constructor(left, operator, right) {
        super();
        this.type = "BinaryExpression";
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}


export class FunctionExpressionTerm extends ExpressionTerm {
    constructor(name, isGenerator, params, body) {
        super();
        this.type = "FunctionExpression";
        this.name = name;
        this.isGenerator = isGenerator;
        this.params = params;
        this.body = body;
    }
}
export class FunctionBodyTerm extends Term {
    constructor(directives, statements) {
        super();
        this.type = "FunctionBody";
        this.directives = directives;
        this.statements = statements;
    }
}

export class FormalParametersTerm extends Term {
    constructor(items, rest = null) {
        super();
        this.type = "FormalParameters";
        this.items = items;
        this.rest = rest;
    }
}


// just a term, no ParenthesizedExpression node
export class ParenthesizedExpressionTerm extends ExpressionTerm {
    constructor(inner) {
        super();
        this.type = "ParenthesizedExpression";
        this.inner = inner;
    }
}


// matching helpers
// function matchCommaSeparatedExpressions(stxl, context) {
//     let result = List();
//     if (stxl.size === 0) { return result; }
//
//     let enf = new Enforester(stxl, List(), context);
//     while (!enf.done) {
//         let term = enf.enforest("expression");
//         if (term instanceof ExpressionTerm) {
//             result = result.concat(term);
//             if (!enf.done) {
//                 enf.matchPunctuator(",");
//             }
//         } else {
//             throw enf.createError(term, "expecting an expression");
//         }
//
//     }
//     return result;
// }
