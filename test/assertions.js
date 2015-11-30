import { parse } from "../src/sweet";
import expect from "expect.js";

function expr(program) {
    return stmt(program).expression;
}

function stmt(program) {
    return program.items[0];
}

function testParse(code, acc, expectedAst) {
    let parsedAst = parse(code, { loc: false });

    expect(acc(parsedAst)).to.eql(expectedAst);
}

export {
    expr, stmt, testParse
};
