/* flow */

import { List } from "immutable";
import { Token } from "./reader";
import { Symbol } from "./symbol";

import { TokenType, TokenClass } from "shift-parser/dist/tokenizer";

export function makeString(value, ctx) {
    let ss = ctx && ctx.scopeset ? ctx.scopeset : undefined;
    return new Syntax({
        value: value
    }, ss);
}

export function makeIdentifier(value, ctx) {
    let ss = ctx && ctx.scopeset ? ctx.scopeset : undefined;
    return new Syntax({
        type: Token.Identifier,
        value: value
    }, ss);
}

function sizeDecending(a, b) {
    if (a.scopes.size > b.scopes.size) {
        return -1;
    } else if (b.scopes.size > a.scopes.size) {
        return 1;
    } else {
        return 0;
    }
}

export default class Syntax {
    // (Token or List<Syntax>, List<Scope>) -> Syntax
    constructor(token, scopeset = List()) {
        this.token = token;
        this.scopeset = scopeset;
    }

    // () -> string
    resolve() {
        if (this.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
            return this.token.value;
        }
        let scope = this.scopeset.last();
        let stxScopes = this.scopeset;
        if (scope) {
            // List<{ scopes: List<Scope>, binding: Symbol }>
            let scopesetBindingList = scope.bindings.get(this);

            if (scopesetBindingList) {
                // { scopes: List<Scope>, binding: Symbol }
                let biggestBindingPair = scopesetBindingList.filter(({scopes, binding}) => {
                    return scopes.isSubset(stxScopes);
                }).sort(sizeDecending);

                if (biggestBindingPair && biggestBindingPair.size === 1) {
                    return biggestBindingPair.get(0).binding.toString();
                }
                if (biggestBindingPair && biggestBindingPair.size !== 1) {
                    throw new Error("Ambiguous scopeset");
                }
            }

        }
        return this.token.value;
    }

    val() {
        return this.token.value;
    }

    // () -> List<Syntax>
    inner() {
        return this.token.slice(1, this.token.size - 1);
    }

    addScope(scope) {
        return new Syntax(this.token, this.scopeset.push(scope));
    }

    isIdentifier() {
        return this.token.type.klass === TokenClass.Ident;
    }
    isBooleanLiteral() {
        return this.token.type === TokenType.TRUE ||
               this.token.type === TokenType.FALSE;
    }
    isKeyword() {
        return this.token.type.klass === TokenClass.Keyword;
    }
    isNullLiteral() {
        return this.token.type === TokenType.NULL;
    }
    isNumericLiteral() {
        return this.token.type.klass === TokenClass.NumericLiteral;
    }
    isPunctuator() {
        return this.token.type.klass === TokenClass.Punctuator;
    }
    isStringLiteral() {
        return this.token.type.klass === TokenClass.StringLiteral;
    }
    isRegularExpression() {
        return this.token.type.klass === TokenClass.RegularExpression;
    }
    isTemplate() {
        return this.token.type === TokenType.TEMPLATE;
    }
    isDelimiter() {
        return List.isList(this.token);
    }
    isParenDelimiter() {
        return this.isDelimiter() &&
               this.token.get(0).type === TokenType.LPAREN;
    }
    isCurlyDelimiter() {
        return this.isDelimiter() &&
               this.token.get(0).type === TokenType.LBRACE;
    }
    isSquareDelimiter() {
        return this.isDelimiter() &&
               this.token.get(0).type === TokenType.LBRACK;
    }
    isEOF() {
        return this.token.type === TokenType.EOS;
    }

    toString() {
        return this.token.value;
    }
}
