/* @flow */

import read, { Token } from "./reader";
import expand from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel-core";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";

import BindingMap from "./bindingMap.js";

import Term, * as T from "./terms";
import { Symbol } from "./symbol";

function tokenArrayToSyntaxList(toks) {
    return List(toks.map(t => {
        if (Array.isArray(t.inner)) {
            return new T.DelimiterTerm(new Syntax(t),
                                     tokenArrayToSyntaxList(t.inner));
        }
        return new T.SyntaxTerm(new Syntax(t));
    }));
}

export function readAsTerms(code: string) {
    return tokenArrayToSyntaxList(read(code));
}

type SweetOptions = {
    foo?: boolean
}

export function parse(source: string, options: SweetOptions = {}) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {
        env: new Env(),
        bindings: new BindingMap()
    });
    let ast = reduce.default(new ParseReducer(), new Term("Module", {
        directives: List(),
        items: exStxl
    }));
    return ast;
}

export function compile(source: string) {
    let ast = parse(source);
    let gen = codegen.default(ast);
    return transform(gen);
}


function expandForExport(source: string) {
    const toks = read(source);
    const stxl = tokenArrayToSyntaxList(toks);
    let exStxl = expand(stxl, {
        env: new Env(),
        bindings: new BindingMap()
    });
    return new Term("Module", {
        directives: List(),
        items: exStxl
    });
}
export {expandForExport as expand};
