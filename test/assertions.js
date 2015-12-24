import { parse, compile } from "../src/sweet";
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


function testEval(source, expectedOutput) {
    let result = compile(source);
    var output;
    eval(result.code);
    expect(output).to.be(expectedOutput);
}

export {
    expr, stmt, testParse, testEval
};
