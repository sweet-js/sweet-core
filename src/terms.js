import expand from "./expander";
import { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert, expect } from "./errors";
import { mixin } from "./utils";
import Syntax from "./syntax";

import {
    Module,
    Script,

    Statement,
    Declaration,
    BlockStatement,
    EmptyStatement,
    ExpressionStatement,
    FunctionDeclaration,
    VariableDeclaration,
    VariableDeclarator,
    ReturnStatement,

    FunctionExpression,
    Expression,
    MemberExpression,
    ArrayExpression,
    IdentifierExpression,
    LiteralExpression,
    CallExpression,
    ObjectExpression,
    Property,
    BinaryExpression
} from "./nodes";

export class Term {
    parse() {
        throw "must implement in subclass";
    }
    expand(context) {
        throw "must implement in subclass";
    }

    getSyntax() {
        return List();
    }
}

export class EOFTerm extends Term { }

// SyntaxTerm and DelimiterTerm are just for internal use, not part of the ast
export class SyntaxTerm extends Term {
    constructor(stx) {
        super();
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

        assert(stx.isDelimiter(), "expecting a delimiter syntax object");

        this.kind = stx.token.value;
        this.inner = inner;
    }
    getSyntax() {
        return this.inner;
    }
}

export class CompileTimeTerm extends Term {}


export class ModuleTerm extends Term {
    constructor(directives, items) {
        super();
        this.type = "Module";
        this.directives = directives;
        this.items = items;
    }
    parse() {
        return new Module(this.directives.map(d => d.parse()).toArray(),
                          this.items.map(i => i.parse()).toArray(),
                          this.loc);
    }

    expand(context) {
        assert(!this.expanded, "ModuleTerm already expanded");

        this.directives = this.directives.map(d => d.expand(context));
        this.items = this.items.map(i => i.expand(context));

        this.expanded = true;
        return this;
    }
}

export class ScriptTerm extends Term {
    constructor(directives, statements) {
        super();
        this.type = "Script";
        this.directives = directives;
        this.statements = statements;
    }
    parse() {
        return new Script(this.directives.map(d => d.parse()).toArray(),
                          this.statements.map(s => s.parse()).toArray(),
                          this.loc);
    }

    expand(context) {
        assert(!this.expanded, "ScriptTerm already expanded");

        this.directives = this.directives.map(d => d.expand(context));
        this.statements = this.statements.map(s => s.expand(context));

        this.expanded = true;
        return this;
    }
}


// mixin for FunctionDeclarationTerm and FunctionExpression
class FunctionTerm {

    parse() {
        let id = this.id;
        if (id !== null) {
            id = new IdentifierExpression(id.resolve());
        }

        let FunctionNode = this instanceof FunctionExpressionTerm ?
                FunctionExpression : FunctionDeclaration;

        return new FunctionNode(id,
                                this.params.map(term => {
                                    let syn = term.getSyntax().first();
                                    return new IdentifierExpression(syn.resolve());
                                }).toArray(),
                                new BlockStatement(this.body.map(t => {
                                    return t.parse();
                                }).toArray()),
                                this.loc);
    }

    expand(context) {
        assert(!this.expanded, "FunctionExpressionTerm already expanded");
        // todo: handle hygiene
        // body is now a list of terms
        this.body = expand(this.body, context);
        this.expanded = true;
        return this;
    }
}



export class StatementTerm extends Term { }

export class DeclarationTerm extends StatementTerm { }

export class EmptyStatementTerm extends StatementTerm {
    constructor() {
        super();
    }
    parse() {
        return new EmptyStatement();
    }
    expand() {
        assert(!this.expanded, "already expanded");
        this.expanded = true;
        return this;
    }
}

export class ReturnStatementTerm extends StatementTerm {
    constructor(argument) {
        super();

        assert(argument === null || argument instanceof ExpressionTerm,
               "expecting an expression for the return argument");
        this.argument = argument;
    }
    parse() {
        return new ReturnStatement(this.argument.parse());
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        if (this.argument) {
            this.argument = this.argument.expand(context);
        }
        this.expanded = true;
        return this;
    }
}

export class BlockStatementTerm extends StatementTerm {
    constructor(body) {
        super();
        this.body = body;
        this.loc = loc;
    }
    parse() {
        return new BlockStatement(this.body.map(b => b.parse()).toArray(), this.loc);
    }
    expand(context) {
        assert(!this.expanded, "BlockStatementTerm already expanded");
        this.body = expand(this.body, context);
        this.expanded = true;
    }
}

export class ExpressionStatementTerm extends StatementTerm {
    constructor(expression) {
        super();
        this.type = "ExpressionStatement";
        this.expression = expression;
    }
    parse() {
        return new ExpressionStatement(this.expression.parse(), this.loc);
    }
    expand(context) {
        assert(!this.expanded, "ExpressionStatement already expanded");

        this.expression = this.expression.expand(context);

        this.expanded = true;
        return this;
    }
}
export class FunctionDeclarationTerm extends mixin(DeclarationTerm, FunctionTerm) {
    constructor(id, params, body) {
        super();
        this.id = id;
        this.params = params;
        this.body = body;
    }
    // parse and expand defined in the FunctionTerm mixin
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
    parse() {
        if (this.kind === "syntax") {
            return new EmptyStatement();
        }
        return new VariableDeclaration(this.declarations.map(d => d.parse()).toArray(),
                                       this.kind);
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        this.declarations = this.declarations.map(d => d.expand(context));
        this.expanded = false;
        return this;
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
    parse() {
        let init = null;
        if (this.init) {
            init = this.init.parse();
        }
        return new VariableDeclarator(new IdentifierExpression(this.id.resolve(), this.loc),
                                      init);
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        if (this.init) {
            this.init = this.init.expand(context);
        }
        this.expanded = true;
        return this;
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
    parse() {
        let val = JSON.stringify(this.stx);
        return new CallExpression(new IdentifierExpression(this.name.resolve()),
            [new LiteralExpression(val)]);
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        // do nothing
        this.expanded = true;
        return this;
    }
}


export class IdentifierExpressionTerm extends ExpressionTerm {
    constructor(ident) {
        super();
        this.type = "IdentifierExpression";
        this.name = ident;
    }
    parse() {
        return new IdentifierExpression(this.name.resolve(), this.loc);
    }
    expand(context) {
        assert(!this.expanded, "IdentifierExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}


export class LiteralNumericExpressionTerm extends ExpressionTerm {

    constructor(value) {
        super();
        this.value = value;
    }

    parse() {
        return new LiteralNumericExpression(this.value);
    }

    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}
export class LiteralStringExpressionTerm extends ExpressionTerm {

    constructor(value) {
        super();
        this.value = value;
    }

    parse() {
        return new LiteralStringExpression(this.value);
    }

    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}
export class BooleanLiteralExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.value = value;
    }
    parse() {
        return new BooleanLiteralExpression(this.value.token.value === "true");
    }

    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }

}
export class NullLiteralExpressionTerm extends ExpressionTerm {
    constructor() {
        super();
    }

    parse() {
        return new NullLiteralExpression();
    }

    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}
export class RegularExpressionLiteralTerm extends ExpressionTerm {
    constructor(value) {
        super();
    }

    parse() {
        return new RegularExpressionLiteralExpression();
    }

    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}

export class LiteralExpressionTerm extends ExpressionTerm {
    constructor(value) {
        super();
        this.value = value;
    }
    parse() {
        let val;
        // need to parse out to the actual JS type
        if (this.value.isBooleanLiteral()) {
            val = this.value.token.value === "true";
        } else if (this.value.isNullLiteral()) {
            val = null;
        } else if (this.value.isRegularExpression()) {
            val = this.value.token.value;
        } else if (this.value.isStringLiteral()) {
            val = this.value.token.value;
        } else if (this.value.isNumericLiteral()) {
            val = this.value.token.value;
        } else {
            assert(false, "unknown token type");
        }
        return new LiteralExpression(val, this.loc);
    }
    expand(context) {
        assert(!this.expanded, "LiteralExpressionTerm already expanded");
        this.expanded = true;
        return this;
    }
}

export class ArrayExpressionTerm extends ExpressionTerm {
    constructor(elements) {
        super();


        assert(List.isList(elements), "expecting a list of expressions");
        // List(null | ExpressionTerm)
        this.elements = elements;
    }
    parse() {
        return new ArrayExpression(this.elements.map(e => {
            if (e === null) { return null; }
            assert(e instanceof ExpressionTerm, "expecting an expression");
            return e.parse();
        }).toArray());
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        this.elements = this.elements.map(e => {
            if (e === null) { return null; }
            assert(e instanceof ExpressionTerm, "expecting an expression");
            return e.expand(context);
        });
        this.expanded = true;
        return this;
    }

}

export class ObjectExpressionTerm extends ExpressionTerm {
    constructor(properties) {
        super();

        assert(List.isList(properties), "expecting a list of properties");
        // List[PropertyTerm]
        this.properties = properties;
    }
    parse() {
        return new ObjectExpression(this.properties.map(p => p.parse()).toArray());
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        this.properties = this.properties.map(p => p.expand(context));
        this.expanded = true;
        return this;
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

    parse() {
        let key;
        if (this.key.isNumericLiteral() || this.key.isStringLiteral()) {
            key = new LiteralExpression(this.key.val());
        } else {
            key = new IdentifierExpression(this.key.val());
        }
        return new Property(key, this.value.parse(), this.kind);
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        // no change to key or kind
        this.value = this.value.expand(context);
        this.expanded = true;
        return this;
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
    parse() {
        return new MemberExpression(this.object.parse(),
                                    this.property.parse(),
                                    this.computed);
    }
    expand(context) {
        assert(!this.expanded, "already expanded");
        this.object = this.object.expand(context);
        this.property = this.property.expand(context);
        this.expanded = true;
        return this;
    }
}

export class CallTerm extends ExpressionTerm {
    constructor(callee, args) {
        super();
        this.callee = callee;
        this.arguments = args;
    }

    parse() {
        return new CallExpression(this.callee.parse(),
                                  this.arguments.map(a => a.parse()).toArray());
    }

    expand(context) {
        assert(!this.expanded, "CallTerm already expanded");
        this.callee  = this.callee.expand(context);
        let matchedArgs = matchCommaSeparatedExpressions(this.arguments,
                                                         context);
        this.arguments = matchedArgs.map(t => t.expand());
        this.expanded = true;
        return this;
    }
}

export class BinaryExpressionTerm extends ExpressionTerm {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    parse() {
        return new BinaryExpression(this.left.parse(),
                                    this.operator,
                                    this.right.parse(),
                                    this.loc);
    }

    expand(context) {
        assert(!this.expanded, "BinaryExpressionTerm already expanded");
        this.left = this.left.expand(context);
        this.right = this.right.expand(context);
        this.expanded = true;
        return this;
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

    parse() {
        // not actually part of the AST so just parse the expression
        return this.expression.parse();
    }
    expand(context) {
        assert(!this.expanded, "ParenthesizedExpressionTerm already expanded");
        this.expression = this.expression.expand(context);
        this.expanded = true;
        return this;
    }
}


// matching helpers

function matchCommaSeparatedExpressions(stxl, context) {
    let result = List();
    if (stxl.size === 0) { return result; }

    let enf = new Enforester(stxl, List(), context);
    while (!enf.done) {
        let term = enf.enforest("expression");
        if (term instanceof ExpressionTerm) {
            result = result.concat(term);
            if (!enf.done) {
                enf.matchPunctuator(",");
            }
        } else {
            throw enf.createError(term, "expecting an expression");
        }

    }
    return result;
}
