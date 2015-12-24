/* flow */

import { List } from "immutable";
import { Token } from "./reader";
import { Symbol } from "./symbol";

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
    constructor(token, scopeset = List()) {
        this.token = token;
        this.scopeset = scopeset;
    }

    resolve() {
        if (this.scopeset.size === 0) {
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

    addScope(scope) {
        return new Syntax(this.token, this.scopeset.push(scope));
    }

    isIdentifier() {
        return this.token.type === Token.Identifier;
    }
    isBooleanLiteral() {
        return this.token.type === Token.BooleanLiteral;
    }
    isKeyword() {
        return this.token.type === Token.Keyword;
    }
    isNullLiteral() {
        return this.token.type === Token.NullLiteral;
    }
    isNumericLiteral() {
        return this.token.type === Token.NumericLiteral;
    }
    isPunctuator() {
        return this.token.type === Token.Punctuator;
    }
    isStringLiteral() {
        return this.token.type === Token.StringLiteral;
    }
    isRegularExpression() {
        return this.token.type === Token.RegularExpression;
    }
    isTemplate() {
        return this.token.type === Token.Template;
    }
    isDelimiter() {
        return this.token.type === Token.Delimiter;
    }
    isParenDelimiter() {
        return this.token.type === Token.Delimiter &&
               this.token.value === "()";
    }
    isCurlyDelimiter() {
        return this.token.type === Token.Delimiter &&
            this.token.value === "{}";
    }
    isSquareDelimiter() {
        return this.token.type === Token.Delimiter &&
            this.token.value === "[]";
    }
    isEOF() {
        return this.token.type === Token.EOF;
    }

    toString() {
        return this.token.value;
    }
}
