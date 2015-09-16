import enforest, { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert } from "./errors";
import {
    CallTerm,
    SyntaxTerm,
    DelimiterTerm,
    ExpressionStatementTerm,
    VariableDeclarationTerm,
    EOFTerm
} from "./terms";
import Syntax from "./syntax";

import {
    CompiletimeTransform
} from "./transforms";

import {
    Program,
    ExpressionStatement,
    FunctionExpression,
    BlockStatement,
    Identifier,
    ReturnStatement

} from "./nodes";

import { transform } from "babel";

// indirect eval so in the global scope
let geval = eval;

function wrapForCompiletime(ast, keys) {
    // todo: hygiene
    let params = keys.map(k => new Identifier(k));
    let body = new ReturnStatement(ast);
    let fn = new FunctionExpression(null, params, new BlockStatement([body]));
    return new Program([new ExpressionStatement(fn)]);
}

// (ExpressionTerm, Context) -> [function]
function loadForCompiletime(ast, context) {
    let sandbox = {
        getExpr: function(stxl) {
            return enforestExpr(stxl, context);
        },
        syntaxQuote: function(str) {
            return List(JSON.parse(str)).map(t => {
                let stx = new Syntax(t.stx.token, t.stx.scopeset);
                if (t.stx && t.stx.token && t.stx.token.inner) {
                    return new DelimiterTerm(stx);
                }
                return new SyntaxTerm(stx);
            });
        }
    };
    let keys = Object.keys(sandbox);
    let sandboxVals = keys.map(k => sandbox[k]);
    let result = transform.fromAst(wrapForCompiletime(ast, keys));
    return geval(result.code).apply(undefined, sandboxVals);
}


function expandTokens(stxl, context) {
    let result = List();
    if (stxl.size === 0) {
        return result;
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, context);
    let lastTerm = null;
    while (!enf.done) {
        let term = enf.enforest();
        // check for coding mistake
        assert(term !== null, "enforester returned a null term");
        assert(term !== lastTerm, "enforester is not done but produced same term");
        lastTerm = term;

        if (term instanceof VariableDeclarationTerm && term.kind === "syntax") {
            // todo: hygiene
            term.declarations.forEach(decl => {
                // finish the expansion early for the declaration
                decl.init = decl.init.expand(context);

                context.env.set(decl.id.resolve(),
                                new CompiletimeTransform(
                                    loadForCompiletime(decl.init.parse(),
                                                       context)));
            });

            // do not add to the result
            continue;
        }


        // don't need the EOF term in the final AST
        if (term instanceof EOFTerm) {
            break;
        }

        result = result.concat(term);
    }
    return result;
}

export default function expand(stxl, context) {
    let terms = expandTokens(stxl, context);
    return terms.map(term => {
        return term.expand(context);
    });
}
