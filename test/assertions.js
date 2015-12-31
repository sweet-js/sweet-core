import { parse, compile } from "../src/sweet";
import expect from "expect.js";
import { zip, curry, equals, cond, identity, T, and, compose, type, mapObjIndexed, map, keys, has } from 'ramda';

function expr(program) {
  return stmt(program).expression;
}

function stmt(program) {
  return program.items[0];
}

// if a property has the string <<hygiene> it is ignored
function testParse(code, acc, expectedAst) {
  let parsedAst = parse(code, {loc: false});
  let isString = (x) => type(x) === 'String';
  let isObject = (x) => type(x) === 'Object';
  let isArray = (x) => type(x) === 'Array';

  function checkObjects(expected, actual) {
    let checkWithHygiene = cond([
      [and(isString, equals('<<hygiene>>')), curry((a, b) => true)],
      [isObject, curry((a, b) => checkObjects(a, b))],
      [isArray, curry((a, b) => map(([a, b]) => checkObjects(a, b), zip(a, b)))],
      [T, curry((a, b) => expect(b).to.be(a))]
    ]);

    mapObjIndexed((prop, key, ob) => {
      let checker = checkWithHygiene(prop);
      expect(actual).to.have.property(key);
      checker(actual[key]);
    }, expected);
  }
  checkObjects(expectedAst, acc(parsedAst));
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
