import { assert } from "./errors";


export class Node {
    constructor(type, loc = null) {
        this.type = type;
    }
}

export class Module extends Node {
    constructor(directives, items, loc = null) {
        super("Module", loc);
        this.directives = directives;
        this.items = items;
    }
}

export class Script extends Node {
    constructor(directives, statements, loc = null) {
        super("Script", loc);
        this.directives = directives;
        this.statements = statements;
    }
}

export class Statement extends Node {}
export class Declaration extends Statement { }

export class EmptyStatement extends Statement {
    constructor(loc = null) {
        super("EmptyStatement", loc);
    }
}
export class BlockStatement extends Statement {
    constructor(body, loc = null) {
        super("BlockStatement", loc);
        this.body = body;
    }
}

export class ExpressionStatement extends Statement {
    constructor(expression, loc = null) {
        super("ExpressionStatement", loc);
        this.expression = expression;
    }
}

export class ReturnStatement extends Statement {
    constructor(argument, loc = null) {
        super("ReturnStatement", loc);

        assert(argument === null || argument instanceof Expression,
                "expecting an argument to return");
        this.argument = argument;
    }
}

export class FunctionDeclaration extends Declaration {
    constructor(id, params, body, loc = null) {
        super("FunctionDeclaration", loc);

        assert(id instanceof IdentifierExpression,
            "expecting a string for the identifier");
        this.id = id;

        assert(Array.isArray(params),
            "expecting an array of parameters for a function declaration");
        this.params = params;

        assert(body instanceof BlockStatement,
            "expecting a block statement for the body of a function declaration");
        this.body = body;
    }
}

export class VariableDeclaration extends Declaration {
    constructor(declarations, kind, loc = null) {
        super("VariableDeclaration", loc);

        assert(Array.isArray(declarations),
            "expecting declarations to be an array of VariableDeclarators");
        this.declarations = declarations;

        assert(kind === "var" || kind === "let" || kind === "const",
                "expecting kind to be var, let, or const");
        this.kind = kind;
    }
}

export class VariableDeclarator extends Node {
    constructor(id, init, loc = null) {
        super("VariableDeclarator", loc);

        assert(id instanceof IdentifierExpression, "expecting an identifier");
        this.id = id;

        assert(init === null || init instanceof Expression,
                "expecting an expression");
        this.init = init;
    }
}

export class Expression extends Node { }

export class IdentifierExpression extends Expression {
    constructor(ident, loc = null) {
        super("IdentifierExpression", loc);
        this.name = ident;
    }
}

export class LiteralExpression extends Expression {
    constructor(value, loc = null) {
        super("LiteralExpression", loc);
        this.value = value;
    }
}

export class ArrayExpression extends Expression {
    constructor(elements, loc = null) {
        super("ArrayExpression", loc);

        assert(Array.isArray(elements), "expecting an array of elements");
        // [null | Expression]
        this.elements = elements;
    }

}

export class ObjectExpression extends Expression {
    constructor(properties, loc = null) {
        super("ObjectExpression", loc);

        assert(Array.isArray(properties), "expecting an array of properties");
        // [Property]
        this.properties = properties;
    }
}

export class Property extends Node {
    constructor(key, value, kind, loc = null) {
        super("Property", loc);

        assert((key instanceof LiteralExpression) || (key instanceof IdentifierExpression), "expecting a literal or an identifier for the key");
        // Literal | Identifier
        this.key = key;

        assert(value instanceof Expression, "expecting an expression for the value");
        // Expression
        this.value = value;

        assert(kind === "init" || kind === "get" || kind === "set", "expecting either init, get, or set for the kind");
        // "init" | "get" | "set"
        this.kind = kind;
    }
}

export class MemberExpression extends Expression {
    constructor(object, property, computed, loc = null) {
        super("MemberExpression", loc);

        assert(object && object instanceof Expression, "expecting an expression for object");
        this.object = object;

        if (computed === true) {
            assert(property && property instanceof Expression, "expecting an expression for property");
        } else {
            assert(property && property instanceof IdentifierExpression, "expecting an identifier for property");
        }
        this.property = property;
        assert(typeof computed === "boolean", "expecting a boolean for computed");
        this.computed = computed;
    }
}

export class CallExpression extends Expression {
    constructor(callee, args, loc = null) {
        super("CallExpression", loc);
        this.callee = callee;
        this.arguments = args;
    }
}

export class BinaryExpression extends Expression {
    constructor(left, operator, right, loc = null) {
        super("BinaryExpression", loc);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class FunctionExpression extends Expression {
    constructor(id, params, body, loc = null) {
        super("FunctionExpression", loc);
        assert(id === null || (id instanceof IdentifierExpression),
            "expecting null or a string for the identifier");
        this.id = id;
        assert(Array.isArray(params),
            "expecting an array of parameters for a function expression");
        this.params = params;
        assert(body instanceof BlockStatement,
            "expecting a block statement for the body of a function expression");
        this.body = body;
    }
}
