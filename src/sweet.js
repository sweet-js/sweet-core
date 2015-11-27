import read from "./reader";
import expand from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";

import Term, * as T from "./terms";

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


export function parse(source, options = {}) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {env: new Env()});
    let ast = reduce.default(new ParseReducer(), new Term("Module", {
        directives: List(),
        items: exStxl
    }));
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
    return new Term("Module", {
        directives: List(),
        items: exStxl
    });
}
export {expandForExport as expand};
