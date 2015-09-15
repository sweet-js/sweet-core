import {
    Term,
    EOFTerm,

    SyntaxQuoteTerm,

    SyntaxTerm,
    DelimiterTerm,
    ExpressionStatementTerm,
    FunctionDeclarationTerm,
    VariableDeclarationTerm,
    VariableDeclaratorTerm,
    ReturnStatementTerm,
    EmptyStatementTerm,

    ExpressionTerm,
    ParenthesizedExpressionTerm,
    MemberExpressionTerm,
    FunctionExpressionTerm,
    ArrayExpressionTerm,
    BinaryExpressionTerm,
    CallTerm,
    ObjectExpressionTerm,
    PropertyTerm,
    LiteralTerm,
    IdentifierTerm } from "./terms";

import {
    FunctionDeclTransform,
    VariableDeclTransform,
    LetDeclTransform,
    ConstDeclTransform,
    SyntaxDeclTransform,
    SyntaxQuoteTransform,
    ReturnStatementTransform,
    CompiletimeTransform
} from "./transforms";
import { List } from "immutable";
import { expect, assert } from "./errors";
import {
    isOperator,
    getOperatorAssoc,
    getOperatorPrec,
    operatorLt
} from "./operators";
import Syntax from "./syntax";

import { matchCommaSeparatedIdentifiers } from "./matcher";

export class Enforester {
    constructor(stxl, prev, context) {
        this.done = false;
        assert(List.isList(stxl), "expecting a list of terms to enforest");
        assert(List.isList(prev), "expecting a list of terms to enforest");
        assert(context, "expecting a context to enforest");
        this.term = null;

        this.rest = stxl;
        this.prev = prev;

        this.context = context;
    }

    peek(n = 0) {
        return this.rest.get(n);
    }

    advance() {
        let ret = this.rest.first();
        this.rest = this.rest.rest();
        return ret;
    }

    consumeSemicolon() {
        let lookahead = this.peek();

        if (lookahead && (lookahead instanceof SyntaxTerm)) {
            let syn = lookahead.getSyntax().first();
            if(syn && syn.isPunctuator() && syn.val() === ";") {
                this.advance();
            }
        }
    }
    consumeComma() {
        let lookahead = this.peek();

        if (lookahead && (lookahead instanceof SyntaxTerm)) {
            let syn = lookahead.getSyntax().first();
            if(syn && syn.isPunctuator() && syn.val() === ",") {
                this.advance();
            }
        }
    }


    unwrapSyntaxTerm(term) {
        if (!(term instanceof SyntaxTerm)) {
            return null;
        }
        return term.getSyntax().first();
    }

    isEOF(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isEOF();
    }

    isIdentifier(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isIdentifier();
    }
    isNumericLiteral(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isNumericLiteral();
    }
    isStringLiteral(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isStringLiteral();
    }
    isBooleanLiteral(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isBooleanLiteral();
    }
    isNullLiteral(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isNullLiteral();
    }
    isRegularExpression(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && syn.isRegularExpression();
    }
    isParenDelimiter(term) {
        return term && (term instanceof DelimiterTerm) &&
            term.kind === "()";
    }
    isCurlyDelimiter(term) {
        return term && (term instanceof DelimiterTerm) &&
            term.kind === "{}";
    }
    isSquareDelimiter(term) {
        return term && (term instanceof DelimiterTerm) &&
            term.kind === "[]";
    }
    isPunctuator(term, val = null) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            syn.isPunctuator() && ((val === null) || (syn.val() === val));
    }
    isOperator(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) && isOperator(syn.val());
    }


    isFnDeclTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === FunctionDeclTransform;
    }
    isVarDeclTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === VariableDeclTransform;
    }
    isLetDeclTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === LetDeclTransform;
    }
    isConstDeclTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === ConstDeclTransform;
    }
    isSyntaxDeclTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === SyntaxDeclTransform;
    }
    isReturnStmtTransform(term) {
        let syn = this.unwrapSyntaxTerm(term);
        return syn && (syn instanceof Syntax) &&
            this.context.env.get(syn.resolve()) === ReturnStatementTransform;
    }

    matchIdentifier() {
        let lookahead = this.advance();
        if (this.isIdentifier(lookahead)) {
            return lookahead.getSyntax().first();
        }
        throw this.createError(lookahead, "expecting an identifier");
    }
    matchLiteral() {
        let lookahead = this.advance();
        if (this.isNumericLiteral(lookahead) ||
            this.isStringLiteral(lookahead) ||
            this.isBooleanLiteral(lookahead) ||
            this.isNullLiteral(lookahead) ||
            this.isRegularExpression(lookahead)) {
            return lookahead.getSyntax().first();
        }
        throw this.createError(lookahead, "expecting a literal");
    }

    matchParens() {
        let lookahead = this.advance();
        if (this.isParenDelimiter(lookahead)) {
            return lookahead.getSyntax();
        }
        throw this.createError(lookahead, "expecting parens");
    }

    matchCurlies() {
        let lookahead = this.advance();
        if (this.isCurlyDelimiter(lookahead)) {
            return lookahead.getSyntax();
        }
        throw this.createError(lookahead, "expecting curly braces");
    }

    matchPunctuator(val) {
        let lookahead = this.advance();
        if (this.isPunctuator(lookahead)) {
            let syn = lookahead.getSyntax().first();
            if (typeof val !== 'undefined') {
                if (syn.val() === val) {
                    return syn;
                } else {
                    throw this.createError(lookahead,
                                           "expecting a " + val + " punctuator");
                }
            }
            return syn;
        }
        throw this.createError(lookahead, "expecting a punctuator");
    }

    createError(stx, message) {
        let ctx = "";
        let offending = stx == null ? null : stx.getSyntax().first();
        if (this.rest.size > 0) {
            ctx = this.rest.slice(0, 20).map(term => {
                return term.getSyntax();
            }).flatten().map(s => {
                if (s === offending) {
                    return "__" + s.val() + "__";
                }
                return s.val();
            }).join(" ");
        }
        return new Error("[error]: " + message + "\n" + ctx);
    }

    /*
     enforest works over:
     prev - a list of the previously enforest Terms
     term - the current term being enforested (initially null)
     rest - remaining Terms to enforest
     */
    enforest(type = "Module") {
        // initialize the term
        this.term = null;

        if (this.rest.size === 0) {
            this.done = true;
            return this.term;
        }

        if (this.isEOF(this.peek())) {
            this.term = new EOFTerm(this.advance());
            return this.term;
        }

        let result;
        if (type === "expression") {
            result = this.enforestExpressionLoop();
        } else {
            result = this.enforestModuleItem();
        }

        if (this.rest.size === 0) {
            this.done = true;
        }
        return result;
    }

    enforestModuleItem() {
        return this.enforestStatement();
    }

    enforestStatement() {
        let lookahead = this.peek();

        if (this.term === null && this.isFnDeclTransform(lookahead)) {
            return this.enforestFunctionDeclaration();
        }

        if (this.term === null &&
            (this.isVarDeclTransform(lookahead) ||
             this.isLetDeclTransform(lookahead) ||
             this.isConstDeclTransform(lookahead) ||
             this.isSyntaxDeclTransform(lookahead))) {
            return this.enforestVariableDeclaration();
        }

        if (this.term === null && this.isReturnStmtTransform(lookahead)) {
            return this.enforestReturnStatement();
        }
        return this.enforestExpressionStatement();
    }

    enforestReturnStatement() {
        let kw = this.advance();
        let lookahead = this.peek();

        // short circuit for the empty expression case
        if (this.rest.size === 0 ||
            (lookahead && !lineNumberEq(kw, lookahead))) {
            return new ReturnStatementTerm(null);
        }

        let term = this.enforestExpressionLoop();
        this.consumeSemicolon();

        return new ReturnStatementTerm(term);
    }

    enforestVariableDeclaration() {
        let kind;
        let lookahead = this.advance();
        let kindSyn = this.unwrapSyntaxTerm(lookahead);

        if (kindSyn &&
            this.context.env.get(kindSyn.resolve()) === VariableDeclTransform) {
            kind = "var";
        } else if (kindSyn &&
                   this.context.env.get(kindSyn.resolve()) === LetDeclTransform) {
            kind = "let";
        } else if (kindSyn &&
                   this.context.env.get(kindSyn.resolve()) === ConstDeclTransform) {
            kind = "const";
        } else if (kindSyn &&
                   this.context.env.get(kindSyn.resolve()) === SyntaxDeclTransform) {
            kind = "syntax";
        }

        let decls = List();

        while (true) {

            let term =  this.enforestVariableDeclarator();

            decls = decls.concat(term);

            let lookahead = this.peek();

            if (this.isPunctuator(lookahead, ",")) {
                this.advance();
            } else {
                break;
            }
        }

        this.consumeSemicolon();
        return new VariableDeclarationTerm(decls, kind);
    }

    enforestVariableDeclarator() {
        let id = this.matchIdentifier();
        let eq = this.unwrapSyntaxTerm(this.advance());

        let init, rest;
        // todo: handle the other assignment operators
        if (eq && eq.val() === "=") {
            init = this.enforestExpressionLoop();
        } else {
            init = null;
        }
        return new VariableDeclaratorTerm(id, init);
    }

    enforestExpressionStatement() {
        let expr = this.enforestExpressionLoop();
        this.consumeSemicolon();

        return new ExpressionStatementTerm(expr);
    }

    enforestExpressionLoop() {
        let lastTerm;

        this.term = null;
        this.opCtx = {
            prec: 0,
            combine: (x) => x,
            stack: List()
        };

        do {
            lastTerm = this.term;
            this.term = this.enforestExpression();

            // if nothing changed, maybe we just need to pop the expr stack
            if (lastTerm === this.term && this.opCtx.stack.size > 0) {
                this.term = this.opCtx.combine(this.term);
                let {prec, combine} = this.opCtx.stack.last();
                this.opCtx.prec = prec;
                this.opCtx.combine = combine;
                this.opCtx.stack = this.opCtx.stack.pop();
            }
        } while (lastTerm !== this.term);  // get a fixpoint
        return this.term;
    }


    enforestExpression() {
        let lookahead = this.peek();

        // $x:ident
        if (this.term === null && this.isIdentifier(lookahead)) {
            return new IdentifierTerm(this.unwrapSyntaxTerm(this.advance()));
        }
        // $x:number || $x:string || $x:boolean || $x:RegExp || $x:null
        if (this.term === null && 
            (this.isNumericLiteral(lookahead) ||
             this.isStringLiteral(lookahead) ||
             this.isNullLiteral(lookahead) ||
             this.isRegularExpression(lookahead) ||
             this.isBooleanLiteral(lookahead))) {
            return new LiteralTerm(this.unwrapSyntaxTerm(this.advance()));
        }
        // ($x:expr)
        if (this.term === null && this.isParenDelimiter(lookahead)) {
            let enf = new Enforester(lookahead.getSyntax(),
                                     List(),
                                     this.context);
            let expr = enf.enforest("expression");
            if (!enf.done) {
                throw enf.createError(enf.peek(), "unexpected syntax");
            }
            this.advance();
            return new ParenthesizedExpressionTerm(expr);
        }
        // $x:FunctionExpression
        if (this.term === null && this.isFnDeclTransform(lookahead)) {
            return this.enforestFunctionExpression();
        }

        if (this.term === null && this.isCurlyDelimiter(lookahead)) {
            return this.enforestObjectExpression();
        }

        // if (p.term === null && p.rest.first() &&
        //     p.rest.first().isCurlyDelimiter()) {
        //     return enforestObjectExpression(p, context);
        // }

        // if (p.term === null && p.rest.first() &&
        //     p.rest.first().isSquareDelimiter()) {
        //     return enforestArrayExpression(p, context);
        // }
        // and then check the cases where the term part of p is something...

        // $x:expr . $prop:ident
        // if (p.term && p.term instanceof ExpressionTerm &&
        //     matchPunc(".", p.rest.first())) {
        //     return enforestStaticMemberExpression(p, context);
        // }
        // $l:expr $op:binaryOperator $r:expr
        if (this.term && this.term instanceof ExpressionTerm &&
            this.isOperator(lookahead)) {
            return this.enforestBinaryExpression();
        }
        // $x:expr (...)
        if (this.term && this.term instanceof ExpressionTerm &&
            this.isParenDelimiter(lookahead)) {
            let paren = this.advance().getSyntax();
            return new CallTerm(this.term, paren);
        }

        return this.term;
    }

    enforestObjectExpression() {
        let obj = this.advance();

        let properties = List();

        let enf = new Enforester(obj.getSyntax(), List(), this.context);

        while (enf.rest.size > 0) {
            let prop = enf.enforestProperty();
            properties = properties.concat(prop);
        }

        return new ObjectExpressionTerm(properties);
    }

    enforestProperty() {
        let key = this.matchIdentifier();
        let colon = this.matchPunctuator(":");

        let value = this.enforestExpressionLoop();
        this.consumeComma();

        return new PropertyTerm(key, value, "init");
    }

    enforestFunctionExpression() {
        let id = null, params, body, rest;
        // eat the function keyword
        this.advance();
        let lookahead = this.peek();

        if (this.isIdentifier(lookahead)) {
            id = this.unwrapSyntaxTerm(this.advance());
        }
        params = this.matchParens("expecting a function parameter list");
        body = this.matchCurlies("expecting a function body");

        let paramIdents = params.filter(term => {
            return this.isIdentifier(term);
        });

        return new FunctionExpressionTerm(id,
                                          paramIdents,
                                          body);
    }


    enforestFunctionDeclaration() {
        let id, params, body, rest;
        // eat the function keyword
        this.advance();
        let lookahead = this.peek();

        id = this.unwrapSyntaxTerm(this.advance());
        params = this.matchParens("expecting a function parameter list");
        body = this.matchCurlies("expecting a function body");

        let paramIdents = params.filter(term => {
            return this.isIdentifier(term);
        });

        return new FunctionDeclarationTerm(id,
                                           paramIdents,
                                           body);
    }

    enforestBinaryExpression() {

        let leftTerm = this.term;
        let opStx = this.unwrapSyntaxTerm(this.peek());
        let op = opStx.val();
        let opPrec = getOperatorPrec(op);
        let opAssoc = getOperatorAssoc(op);

        if (operatorLt(this.opCtx.prec, opPrec, opAssoc)) {
            this.opCtx.stack = this.opCtx.stack.push({
                prec: this.opCtx.prec,
                combine: this.opCtx.combine
            });
            this.opCtx.prec = opPrec;
            this.opCtx.combine = (rightTerm) => {
                if (!(rightTerm instanceof ExpressionTerm)) {
                    throw this.createError(rightTerm,
                                           "expecting an expression on the right side of a binary operator");
                }
                return new BinaryExpressionTerm(leftTerm, op, rightTerm);
            };
            this.advance();
            return null;
        } else {
            let term = this.opCtx.combine(leftTerm);
            // this.rest does not change
            let { prec, combine } = this.opCtx.stack.last();
            this.opCtx.stack = this.opCtx.stack.pop();
            this.opCtx.prec = prec;
            this.opCtx.combine = combine;
            return term;
        }
    }
}

export default function enforest(stxl, context) {
    let p = {
        term: null,
        rest: stxl
    };
    if (stxl.size === 0) {
        return p;
    }
    if (p.rest.first().isEOF()) {
        return enforestEOFTerm(p, context);
    }

    return enforestModuleItem(p, context);
}


function enforestModuleItem(p, context) {
    return enforestStatement(p, context);
}

function lineNumberEq(a, b) {
    let asyn = this.unwrapSyntaxTerm(a),
        bsyn = this.unwrapSyntaxTerm(b);

    if (!(asyn && bsyn)) {
        return false;
    }
    let aLineNumber = asyn.isDelimiter() ? asyn.token.startLineNumber : asyn.token.lineNumber;
    let bLineNumber = bsyn.isDelimiter() ? bsyn.token.startLineNumber : bsyn.token.lineNumber;
    return aLineNumber === bLineNumber;
}

function consumeSemicolon(p) {
    if (matchPunc(";", p.rest.first())) {
        p.rest = p.rest.rest();
    }
    return p;
}

function enforestReturnStatement(p, context) {
    let kw = p.rest.first();
    let rest = p.rest.rest();
    p.rest = rest;

    // short circuit for the empty expression case
    if (p.rest.size === 0 ||
        (p.rest.first() && !lineNumberEq(kw, p.rest.first()))) {
        p.term = new ReturnStatementTerm(null);
        return p;
    }

    p = enforestExpressionLoop(p, context);

    expect(p.term instanceof ExpressionTerm,
           "expecting an expression in the return statement", rest.first(), rest.unshift(kw));
    p = consumeSemicolon(p);
    p.term = new ReturnStatementTerm(p.term);
    return p;
}

function enforestEmptyStatement(p, context) {
    let semi = p.rest.first();

    expect(semi && semi.isPunctuator() && semi.val() === ";",
           "expecting a semicolon", semi, p.rest);

    p.term = new EmptyStatementTerm();
    p.rest = p.rest.rest();
    return p;
}

function expandMacro(p, context) {
    let name = p.rest.first();

    let ct = context.env.get(name.resolve());
    expect(ct, "expecting a compiletime value for the syntax:" + name.val(),
           name, p.rest);
    expect(typeof ct.value.match === "function",
           "expecting a match function for applicable compiletime values", name, p.rest);
    expect(typeof ct.value.transform === "function",
           "expecting a transform function for applicable compiletime values", name, p.rest);

    let matchResult = ct.value.match(p.rest);
    expect(matchResult && matchResult.subst,
           "expecting a result with substitution from the macro: " + name.val());
    expect(matchResult && matchResult.rest,
           "expecting a result with the rest of the syntax from the macro: " + name.val());
    let rest = matchResult.rest;

    let transformResult = ct.value.transform(matchResult.subst);
    expect(List.isList(transformResult),
           "expecting a list as a result of invoking macro: " + name.val());

    p.term = null;
    p.rest = transformResult.concat(rest);
    return p;
}


function enforestStatement(p, context) {
    // handle declarations
    let first = p.rest.first();

    if (p.term === null && first &&
        context.env.get(first.resolve()) instanceof CompiletimeTransform) {
        p = expandMacro(p, context);
    }

    if (p.term === null && first &&
        context.env.get(first.resolve()) === FunctionDeclTransform) {
        return enforestFunctionDeclaration(p, context);
    }
    if (p.term === null && first &&
        (context.env.get(first.resolve()) === VariableDeclTransform ||
         context.env.get(first.resolve()) === LetDeclTransform ||
         context.env.get(first.resolve()) === ConstDeclTransform ||
         context.env.get(first.resolve()) === SyntaxDeclTransform)) {
        return enforestVariableDeclaration(p, context);
    }
    if (p.term === null && first &&
        (context.env.get(first.resolve()) === ReturnStatementTransform)) {
        return enforestReturnStatement(p, context);
    }
    if (p.term === null && first &&
        first.isPunctuator() && first.val() === ";") {
        return enforestEmptyStatement(p, context);
    }

    // handle expressions
    p = enforestExpressionLoop(p, context);
    if (p.term !== null) {
        p.term = new ExpressionStatementTerm(p.term);
        p = consumeSemicolon(p);
    }
    return p;
}

function enforestVariableDeclaration(p, context) {
    let kind;
    let first = p.rest.first().resolve();
    if (context.env.get(first) === VariableDeclTransform) {
        kind = "var";
    } else if (context.env.get(first) === LetDeclTransform) {
        kind = "let";
    } else if (context.env.get(first) === ConstDeclTransform) {
        kind = "const";
    } else if (context.env.get(first) === SyntaxDeclTransform) {
        kind = "syntax";
    }

    // drop the keyword
    p.rest = p.rest.rest();

    let decls = List();

    while (true) {

        p = enforestVariableDeclarator(p, context);
        decls = decls.concat(p.term);

        if (p.rest.first() && p.rest.first().isPunctuator() &&
            p.rest.first().val() === ",") {
            // drop the comma
            p.term = null;
            p.rest = p.rest.rest();
        } else {
            break;
        }
    }

    p.term = new VariableDeclarationTerm(decls, kind);
    p = consumeSemicolon(p);
    return p;
}

function enforestVariableDeclarator(p, context) {

    let id = p.rest.get(0);
    let allStx = p.rest;

    expect(id && id.isIdentifier(),
           "expecting an identifier for a var declaration",
           id, p.rest);

    let eq = p.rest.get(1);
    let init, rest;
    // todo: handle the other assignment operators
    if (eq && eq.val() === "=") {
        p.rest = p.rest.slice(2);
        let startofExpr = p.rest.first();

        p = enforestExpressionLoop(p, context);
        expect(p.term && p.term instanceof ExpressionTerm,
               "expecting an expression as the initializer of a var declaration",
               startofExpr, allStx);
        init = p.term;
        rest = p.rest;
    } else {
        init = null;
        rest = p.rest.slice(1);
    }
    p.term = new VariableDeclaratorTerm(id, init);
    p.rest = rest;
    return p;
}

function enforestFunctionDeclaration(p, context) {
    expect(p.term === null && p.rest.first() &&
           context.env.get(p.rest.first().resolve()) === FunctionDeclTransform,
           "expecting a function keyword", p.rest.first(), p.rest);

    let id = p.rest.get(1);
    expect(id && id.isIdentifier(),
           "expecting an identifier for a function declaration",
           id, p.rest);

    let params = p.rest.get(2);
    expect(params && params.isParenDelimiter(),
           "expecting a paren list for a function declaration",
           params, p.rest);

    let body = p.rest.get(3);
    expect(body && body.isCurlyDelimiter(),
           "expecting a body for a function declaration",
           body, p.rest);

    let rest = p.rest.slice(4);
    p.term = new FunctionDeclarationTerm(id,
                                         matchCommaSeparatedIdentifiers(params.token.inner),
                                         body.token.inner);
    p.rest = rest;
    return p;
}

// nice wrapper around enforesting just expressions for external consumers
export function enforestExpr(stxl, context) {
    return enforestExpressionLoop({term: null, rest: stxl}, context);
}

// expressions are complicated because we want to handle operators with
// precedence and stuff so we have a loop and other strangeness
function enforestExpressionLoop(p, context) {

    let lastTerm;
    let opCtx = {
        prec: 0,
        combine: (x) => x,
        stack: List()
    };

    do {
        lastTerm = p.term;

        p = enforestExpression(p, opCtx, context);

        // if nothing changed, maybe we just need to pop the expr stack
        if (lastTerm === p.term && opCtx.stack.size > 0) {
            p.term = opCtx.combine(p.term);
            let {prec, combine } = opCtx.stack.last();
            opCtx.prec = prec;
            opCtx.combine = combine;
            opCtx.stack = opCtx.stack.pop();
        }
    } while (lastTerm !== p.term);  // get a fixpoint
    return p;
}

function enforestSyntaxQuote(p, context) {
    let name = p.rest.get(0);
    let body = p.rest.get(1);
    let rest = p.rest.slice(2);

    expect(body && body.isCurlyDelimiter(),
           "expecting a body for syntax quote",
           body, p.rest);

    p.term = new SyntaxQuoteTerm(name, body.token.inner);
    p.rest = rest;
    return p;
}

function enforestProperty(p, context) {

    let key = p.rest.get(0);
    expect(key && key.isIdentifier(),
           "expecting an identifier", key, p.rest);

    let colon = p.rest.get(1);
    expect(matchPunc(":", colon),
           "expecting a `:`", colon, p.rest);

    p.term = null;
    p.rest = p.rest.slice(2);
    let startofExpr = p.rest.first();

    p = enforestExpressionLoop(p, context);
    let value = p.term;
    expect(value instanceof ExpressionTerm,
           "expecting an expression", startofExpr, p.rest);

    // must be separated by commas
    if (matchPunc(",", p.rest.first())) {
        p.rest = p.rest.rest();
    } else if (p.rest.size !== 0) {
        expect(false, "expecting comma", p.rest.first(), p.rest);
    }
    p.term = new PropertyTerm(key, value, "init");
    return p;
}

function matchPunc(punc, stx) {
    return stx && stx.isPunctuator() && stx.val() === punc;
}

function enforestObjectExpression(p, context) {
    let obj = p.rest.first();
    let rest = p.rest.rest();
    let properties = List();

    p.term = null;
    p.rest = obj.token.inner;

    while (p.rest.size > 0) {
        p = enforestProperty(p, context);
        properties = properties.concat(p.term);
        p.term = null;
    }

    p.term = new ObjectExpressionTerm(properties);
    p.rest = rest;
    return p;
}

function enforestArrayExpression(p, context) {
    let arr = p.rest.first();
    let rest = p.rest.rest();
    let elements = List();

    p.rest = arr.token.inner;
    while (p.rest.size > 0) {
        if (matchPunc(",", p.rest.first())) {
            elements = elements.concat(null);
            p.rest = p.rest.rest();
        } else {
            let startOfExpr = p.rest.first();
            p = enforestExpressionLoop(p, context);
            expect(p.term && (p.term instanceof ExpressionTerm),
                   "expecting an expression", startOfExpr, p.rest);
            elements = elements.concat(p.term);
            p.term = null;
            // consume trailing commas
            if (matchPunc(",", p.rest.first())) {
                p.rest = p.rest.rest();
            }
        }
    }
    p.term = new ArrayExpressionTerm(elements);
    p.rest = rest;
    return p;
}

function enforestStaticMemberExpression (p, context) {
    let object = p.term;
    let dot = p.rest.get(0);
    let property = p.rest.get(1);

    expect(property && property.isIdentifier(),
           "expecting an identifier for static member expression",
           property, p.rest);

    p.term = new MemberExpressionTerm(object, new IdentifierTerm(property), false);
    p.rest = p.rest.slice(2);
    return p;

}

function enforestExpression(p, opCtx, context) {

    // check the cases where the term part of p is null first...

    if (p.term === null && p.rest.first() &&
        context.env.get(p.rest.first().resolve()) instanceof CompiletimeTransform) {
        p = expandMacro(p, context);
    }

    // syntaxQuote { ... }
    if (p.term === null && p.rest.first()
        && context.env.get(p.rest.first().resolve()) === SyntaxQuoteTransform) {
        return enforestSyntaxQuote(p, context);
    }

    // $x:ident
    if (p.term === null && p.rest.first() && p.rest.first().isIdentifier()) {
        return enforestIdentifier(p, opCtx, context);
    }

    // $x:number || $x:string || $x:boolean || $x:RegExp || $x:null
    if (p.term === null && p.rest.first() &&
        (p.rest.first().isNumericLiteral() ||
         p.rest.first().isStringLiteral() ||
         p.rest.first().isNullLiteral() ||
         p.rest.first().isRegularExpression() ||
         p.rest.first().isBooleanLiteral())) {
        return enforestLiteral(p, opCtx, context);
    }
    // ($x:expr)
    if (p.term === null && p.rest.first() &&
        p.rest.first().isParenDelimiter()) {
        return enforestParenthesizedExpression(p, opCtx, context);
    }

    if (p.term === null && p.rest.first() &&
        p.rest.first().isCurlyDelimiter()) {
        return enforestObjectExpression(p, context);
    }

    if (p.term === null && p.rest.first() &&
        p.rest.first().isSquareDelimiter()) {
        return enforestArrayExpression(p, context);
    }

    // and then check the cases where the term part of p is something...

    // $x:expr . $prop:ident
    if (p.term && p.term instanceof ExpressionTerm &&
        matchPunc(".", p.rest.first())) {
        return enforestStaticMemberExpression(p, context);
    }
    // $x:expr (...)
    if (p.term && p.term instanceof ExpressionTerm &&
        p.rest.first() &&
        p.rest.first().isParenDelimiter()) {
        return enforestCall(p, opCtx, context);
    }
    // $l:expr $op:binaryOperator $r:expr
    if (p.term && p.term instanceof ExpressionTerm &&
        p.rest.first() && isOperator(p.rest.first().val())) {
        return enforestBinaryExpression(p, opCtx, context);
    }

    // $x:FunctionExpression
    if (p.term === null && p.rest.first() &&
        context.env.get(p.rest.first().resolve()) === FunctionDeclTransform) {
        return enforestFunctionExpression(p, opCtx, context);
    }

    // otherwise nothing to change this time
    return p;
}

function enforestFunctionExpression(p, opCtx, context) {
    expect(p.term === null && p.rest.first() &&
           context.env.get(p.rest.first().resolve()) === FunctionDeclTransform,
           "expecting a function expression", p.rest.first(), p.rest);

    expect(p.rest.get(1) && p.rest.get(2),
           "bad syntax for function expresssion", p.rest.get(1), p.rest);

    let id = null, params, body, rest;
    if (p.rest.get(1).isIdentifier()) {
        id = p.rest.get(1);
        params = p.rest.get(2);
        expect(params && params.isParenDelimiter(),
               "expecting a function parameter list",
               params, p.rest);

        body = p.rest.get(3);
        expect(body && body.isCurlyDelimiter(),
               "expecting a function body",
               body, p.rest);

        rest = p.rest.slice(4);
    } else {
        params = p.rest.get(1);
        expect(params && params.isParenDelimiter(),
               "expecting a function parameter list",
               params, p.rest);

        body = p.rest.get(2);
        expect(body && body.isCurlyDelimiter(),
               "expecting a function body",
               body, p.rest);

        rest = p.rest.slice(3);
    }
    p.term = new FunctionExpressionTerm(id,
                                        matchCommaSeparatedIdentifiers(params.token.inner),
                                        body.token.inner);
    p.rest = rest;
    return p;
}

function enforestParenthesizedExpression(p, opCtx, context) {
    let paren = p.rest.first();

    let {term, rest} = enforestExpr(paren.token.inner, context);
    // todo: won't work for arrow functions
    expect(rest.size === 0, "expecting only a single expression",
           null, p.rest);
    p.term = new ParenthesizedExpressionTerm(term);
    p.rest = p.rest.rest();
    return p;
}

function enforestBinaryExpression(p, opCtx, context) {

    let leftTerm = p.term;
    let op = p.rest.first().val();
    let opPrec = getOperatorPrec(op);
    let opAssoc = getOperatorAssoc(op);

    if (operatorLt(opCtx.prec, opPrec, opAssoc)) {
        opCtx.stack = opCtx.stack.push({
            prec: opCtx.prec,
            combine: opCtx.combine
        });
        opCtx.prec = opPrec;
        opCtx.combine = (rightTerm) => {
            expect(rightTerm instanceof ExpressionTerm,
                   "expecting an expression on the right side of a binary operator",
                   null, p.rest);
            return new BinaryExpressionTerm(leftTerm, op, rightTerm);
        };
        p.term = null;
        p.rest = p.rest.rest();
        return p;
    } else {
        p.term = opCtx.combine(leftTerm);
        // p.rest does not change
        let { prec, combine } = opCtx.stack.last();
        opCtx.stack = opCtx.stack.pop();
        opCtx.prec = prec;
        opCtx.combine = combine;
        return p
    }
}

function enforestCall(p, opCtx, context) {
    p.term = new CallTerm(p.term, p.rest.first());
    p.rest = p.rest.rest();
    return p;
}

function enforestIdentifier(p, opCtx, context) {
    p.term = new IdentifierTerm(p.rest.first());
    p.rest = p.rest.rest();
    return p;
}
function enforestLiteral(p, opCtx, context) {
    p.term = new LiteralTerm(p.rest.first());
    p.rest = p.rest.rest();
    return p;
}

function enforestEOFTerm(p, context) {
    p.term = new EOFTerm(p.rest.first());
    p.rest = p.rest.rest();
    return p;
}
