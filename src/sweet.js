import read from "./reader";
import expand from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel";

import { SyntaxTerm, DelimiterTerm, ModuleTerm } from "./terms";

import {
    Module
} from "./nodes";

function tokenArrayToSyntaxList(toks) {
    return List(toks.map(t => {
        if (Array.isArray(t.inner)) {
            return new DelimiterTerm(new Syntax(t),
                                     tokenArrayToSyntaxList(t.inner));
        }
        return new SyntaxTerm(new Syntax(t));
    }));
}

export function parse(source, options = {}) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {env: new Env()});
    let ast = new ModuleTerm(List(), exStxl).parse();
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
    return new ModuleTerm(List(), exStxl);
}
export {expandForExport as expand};
