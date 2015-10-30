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


// mixin for FunctionDeclarationTerm and FunctionExpression
class FunctionTerm {

    // parse() {
    //     let id = this.id;
    //     if (id !== null) {
    //         id = new IdentifierExpression(id.resolve());
    //     }
    //
    //     let FunctionNode = this instanceof FunctionExpressionTerm ?
    //             FunctionExpression : FunctionDeclaration;
    //
    //     return new FunctionNode(id,
    //                             this.params.map(term => {
    //                                 let syn = term.getSyntax().first();
    //                                 return new IdentifierExpression(syn.resolve());
    //                             }).toArray(),
    //                             new BlockStatement(this.body.map(t => {
    //                                 return t.parse();
    //                             }).toArray()),
    //                             this.loc);
    // }

}



export class StatementTerm extends Term { }
export class DeclarationTerm extends StatementTerm { }
export class EmptyStatementTerm extends StatementTerm { }
export class ReturnStatementTerm extends StatementTerm {
    constructor(argument) {
        super();

        assert(argument === null || argument instanceof ExpressionTerm,
               "expecting an expression for the return argument");
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
export class FunctionDeclarationTerm extends mixin(DeclarationTerm, FunctionTerm) {
    constructor(id, params, body) {
        super();
        this.id = id;
        this.params = params;
        this.body = body;
    }
}
export class VariableDeclarationTerm extends DeclarationTerm {
    constructor(declarations, kind) {
        super();

        assert(List.isList(declarations),
            "expecting declarations to be a list of VariableDeclarators");
        this.declarations = declarations;

        assert(kind === "var" || kind === "let" || kind === "const" || kind === "syntax",
               "expecting kind to be var, let, syntax, or const");
        this.kind = kind;
    }
}
export class VariableDeclaratorTerm extends Term {
    constructor(id, init) {
        super();

        assert(id != null && id.isIdentifier(), "expecting an identifier");
        this.id = id;

        assert(init === null || init instanceof ExpressionTerm,
            "expecting an expression");
        this.init = init;
    }
}


export class ExpressionTerm extends Term { }
export class SyntaxQuoteTerm extends ExpressionTerm {
    constructor(name, stx) {
        super();

        assert(name && name.isIdentifier(), "expecting an identifier syntax object");
        this.name = name; // for hygiene purposes

        assert(List.isList(stx), "expecting a list of syntax objects");
        this.stx = stx;
    }
}
export class IdentifierExpressionTerm extends ExpressionTerm {
    constructor(ident) {
        super();
        this.type = "IdentifierExpression";
        this.name = ident;
    }
}
export class LiteralNumericExpressionTerm extends ExpressionTerm {

    constructor(value) {
        super();
        this.value = value;
    }

}
export class LiteralStringExpressionTerm extends ExpressionTerm {

    constructor(value) {
        super();
        this.value = value;
    }

}
export class BooleanLiteralExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.value = value;
    }
}
export class NullLiteralExpressionTerm extends ExpressionTerm {
    constructor() {
        super();
    }
}
export class RegularExpressionLiteralTerm extends ExpressionTerm {
    constructor(value) {
        super();
    }
}

export class LiteralExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.value = value;
    }
}

export class ArrayExpressionTerm extends ExpressionTerm {
    constructor(elements) {
        super();
        assert(List.isList(elements), "expecting a list of expressions");
        // List(null | ExpressionTerm)
        this.elements = elements;
    }
}

export class ObjectExpressionTerm extends ExpressionTerm {
    constructor(properties) {
        super();

        assert(List.isList(properties), "expecting a list of properties");
        // List[PropertyTerm]
        this.properties = properties;
    }
}
export class PropertyTerm extends Term {
    constructor(key, value, kind) {
        super();

        assert(key && (key.isNumericLiteral() ||
                       key.isIdentifier() ||
                       key.isStringLiteral()),
            "expecting a number, string, or identifier syntax object for the property key");
        this.key = key;

        assert(value instanceof ExpressionTerm,
            "expecting an expression term for the property value");
        this.value = value;

        assert(kind === "init" || kind === "get" || kind === "set",
            "expecting init, get or set for property");
        this.kind = kind;
    }
}
export class MemberExpressionTerm extends ExpressionTerm {
    constructor(object, property, computed) {
        super();

        assert(object && object instanceof ExpressionTerm, "expecting an expression for object");
        this.object = object;
        if (computed === true) {
            assert(property && property instanceof ExpressionTerm, "expecting an expression for property");
        } else {
            assert(property && property instanceof IdentifierExpressionTerm, "expecting an identifier for property");
        }
        this.property = property;
        assert(typeof computed === "boolean", "expecting a boolean for computed");
        this.computed = computed;
    }
}
export class CallTerm extends ExpressionTerm {
    constructor(callee, args) {
        super();
        this.callee = callee;
        this.arguments = args;
    }
}
export class BinaryExpressionTerm extends ExpressionTerm {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}
export class FunctionExpressionTerm extends mixin(ExpressionTerm, FunctionTerm) {
    constructor(id, params, body) {
        super();
        assert(id === null || id.isIdentifier(), "expecting an identifier syntax object");
        this.id = id;
        assert(List.isList(params), "expecting a list of syntax objects for the params");
        this.params = params;
        assert(List.isList(body), "expecting a list of syntax objects for the body");
        this.body = body;
    }
}
// just a term, no ParenthesizedExpression node
export class ParenthesizedExpressionTerm extends ExpressionTerm {
    constructor(expression) {
        super();
        assert(expression && (expression instanceof ExpressionTerm), "expecting an expression");

        this.expression = expression;
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
